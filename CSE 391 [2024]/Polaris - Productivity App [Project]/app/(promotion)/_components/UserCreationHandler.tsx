'use client';

import { useUser } from "@clerk/clerk-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";

export function UserCreationHandler() {
  const { user } = useUser();
  const createUser = useMutation(api.users.createUser);

  useEffect(() => {
    if (user) {
      createUser({
        email: user.primaryEmailAddress?.emailAddress || '',
        fullName: user.fullName || '',
        userId: user.id,
      });
    }
  }, [user, createUser]);

  return null;
}