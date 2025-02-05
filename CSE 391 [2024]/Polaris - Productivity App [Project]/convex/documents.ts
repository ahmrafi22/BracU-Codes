import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

const validateUser = async (ctx: any): Promise<string> => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not Loggedin");
  return identity.subject; 
};

export const getSideBar = query({
  args: {
    parentDocument: v.optional(v.id("documents")), 
  },
  handler: async (ctx, args) => {
    const userId = await validateUser(ctx); 
    return await ctx.db
      .query("documents")
      .withIndex("by_user_parent", (q: any) =>
        q.eq("userId", userId).eq("parentDocument", args.parentDocument),
      )
      .filter((q: any) => q.eq(q.field("isArchived"), false)) 
      .order("desc") 
      .collect(); 
  },
});

export const get = query({
  handler: async (ctx) =>{
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
          throw new Error("Not Loggedin")
      }

      const documents = await ctx.db.query("documents").collect();

      return documents
  }
});

export const getTotalDocuments = query({
  args: {},
  handler: async (ctx) => {
    const documents = await ctx.db.query("documents").collect();
    return documents.length;
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    parentDocument: v.optional(v.id("documents"))
  },
  handler: async(ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not Loggedin")
    }

    const userId = identity.subject;

    // Check parent document depth and child count
    let depth = 0;
    if (args.parentDocument) {
      const parentDoc = await ctx.db.get(args.parentDocument);
      if (parentDoc) {
        // Prevent creating more than 3 children at each level
        const childDocuments = await ctx.db
          .query("documents")
          .filter(q => q.eq(q.field("parentDocument"), args.parentDocument))
          .collect();

        if (childDocuments.length >= 3) {
          throw new Error("Maximum of 3 child documents allowed");
        }

        depth = (parentDoc.depth || 0) + 1;

        // Prevent creating children beyond depth 2
        if (depth > 2) {
          throw new Error("Cannot create more nested documents");
        }
      }
    }

    const document = await ctx.db.insert("documents", {
      title: args.title,
      parentDocument: args.parentDocument,
      userId,
      isArchived: false,
      isPublished: false,
      depth, // Store the depth of the document
    });

    return document;
  }
});

export const getNestedDocumentsCount = query({
  args: {
    parentDocument: v.optional(v.id("documents"))
  },
  handler: async (ctx, args) => {
    if (!args.parentDocument) return 0;

    // Find the parent document to check its depth
    const parentDoc = await ctx.db.get(args.parentDocument);
    
    // If no parent document found, return 0
    if (!parentDoc) return 0;

    // Determine the current depth
    const depth = parentDoc.depth || 0;

    // If already at max allowed depth (2), prevent further child creation
    if (depth >= 2) return 3; // Return 3 to block child creation

    // Count direct children using .collect() and length
    const childDocuments = await ctx.db
      .query("documents")
      .filter(q => q.eq(q.field("parentDocument"), args.parentDocument))
      .collect();

    return childDocuments.length;
  }
});

export const getChildDocumentsCount = query({
  args: {
    parentDocument: v.optional(v.id("documents"))
  },
  handler: async (ctx, args) => {
    if (!args.parentDocument) return 0;

    const childDocuments = await ctx.db
      .query("documents")
      .filter(q => q.eq(q.field("parentDocument"), args.parentDocument))
      .collect();

    return childDocuments.length;
  }
});


const fetchDocument = async (ctx: any, id: Id<"documents">, userId: string) => {
  const document = await ctx.db.get(id);
  if (!document || document.userId !== userId) throw new Error("Unauthorized");
  return document; // Return the document if it exists and the user is authorized
};


const recursiveOperation = async (
  ctx: any,
  documentId: Id<"documents">,
  userId: string,
  isArchived: boolean,
) => {
  const children = await ctx.db
    .query("documents")
    .withIndex("by_user_parent", (q: any) =>
      q.eq("userId", userId).eq("parentDocument", documentId),
    )
    .collect();

  // Iterate over each child document
  for (const child of children) {
    await ctx.db.patch(child._id, { isArchived }); // Update the archive status
    await recursiveOperation(ctx, child._id, userId, isArchived); // Recursively update children
  }
};


export const archiveDocument = mutation({
  args: { id: v.id("documents") }, // Document ID to archive
  handler: async (ctx, args) => {
    const userId = await validateUser(ctx); // Validate the user
    await fetchDocument(ctx, args.id, userId); // Fetch and validate the document
    await ctx.db.patch(args.id, { isArchived: true }); // Archive the document
    await recursiveOperation(ctx, args.id, userId, true); // Recursively archive children
  },
});

// Query to get all archived documents (the trash)
export const getTrash = query({
  handler: async (ctx) => {
    const userId = await validateUser(ctx); // Validate the user
    return await ctx.db
      .query("documents")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .filter((q: any) => q.eq(q.field("isArchived"), true)) // Only include archived documents
      .order("desc")
      .collect(); // Collect and return results
  },
});


export const restore = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const existingDocument = await ctx.db.get(args.id);

    if (!existingDocument) {
      throw new Error("Not found");
    }

    if (existingDocument.userId !== userId) {
      throw new Error("Unauthorized");
    }

    const recursiveRestore = async (documentId: Id<"documents">) => {
      const children = await ctx.db
        .query("documents")
        .withIndex("by_user_parent", (q) =>
          q.eq("userId", userId).eq("parentDocument", documentId)
        )
        .collect();

      for (const child of children) {
        await ctx.db.patch(child._id, {
          isArchived: false,
        });

        await recursiveRestore(child._id);
      }
    };

    const options: Partial<Doc<"documents">> = {
      isArchived: false,
    };

    if (existingDocument.parentDocument) {
      const parent = await ctx.db.get(existingDocument.parentDocument);
      if (parent?.isArchived) {
        options.parentDocument = undefined;
      }
    }

    const document = await ctx.db.patch(args.id, options);

    await recursiveRestore(args.id);

    return document;
  },
});

export const remove = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const existingDocument = await ctx.db.get(args.id);

    if (!existingDocument) {
      throw new Error("Not found");
    }

    if (existingDocument.userId !== userId) {
      throw new Error("Unauthorized");
    }

    const document = await ctx.db.delete(args.id);

    return document;
  },
});


export const getSearch = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const documents = await ctx.db
      .query("documents")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isArchived"), false))
      .order("desc")
      .collect();

    return documents;
  },
});


export const getById = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    const document = await ctx.db.get(args.documentId);

    if (!document) {
      throw new Error("Not found");
    }

    if (document.isPublished && !document.isArchived) {
      return document;
    }

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    if (document.userId !== userId) {
      throw new Error("Unauthorized");
    }

    return document;
  },
});



export const update = mutation({
  args: {
    id: v.id("documents"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    icon: v.optional(v.string()),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const { id, ...rest } = args;

    const existingDocument = await ctx.db.get(args.id);

    if (!existingDocument) {
      throw new Error("Document not found");
    }

    if (existingDocument.userId !== userId) {
      throw new Error("Unauthorized");
    }

    const document = await ctx.db.patch(args.id, {
      ...rest,
    });

    return document;
  },
});

export const removeIcon = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const userId = identity.subject;

    const existingDocument = await ctx.db.get(args.id);

    if (!existingDocument) {
      throw new Error("Not found");
    }

    if (existingDocument.userId !== userId) {
      throw new Error("Unauthorized");
    }

    const document = await ctx.db.patch(args.id, { icon: undefined });

    return document;
  },
});


export const removeCoverImage = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const userId = identity.subject;

    const existingDocument = await ctx.db.get(args.id);

    if (!existingDocument) {
      throw new Error("Not found");
    }

    if (existingDocument.userId !== userId) {
      throw new Error("Unauthorized");
    }

    const document = await ctx.db.patch(args.id, { coverImage: undefined });

    return document;
  },
});