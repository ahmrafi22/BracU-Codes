import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Gochi_Hand } from 'next/font/google';
import { cn } from '@/lib/utils';

export const gochiHand = Gochi_Hand({
  weight: '400',
  subsets: ['latin'],
});

interface Quote {
  content: string;
  author: string;
}

export default function QuoteOfTheDay() {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchQuote = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://api.api-ninjas.com/v1/quotes', {
        headers: {
          'X-Api-Key': 'EhCn1DiZkyfyBnRKgrGULg==CBdzJ26PhhxNmGJe'
        }
      });
      const [data] = await response.json();
      setQuote({
        content: data.quote,
        author: data.author
      });
    } catch (error) {
      console.error('Error fetching quote:', error);
      setQuote({
        content: "The only way to do great work is to love what you do.",
        author: "Steve Jobs"
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchQuote();
  }, []);

  const calculateFontSize = (text: string) => {
    if (text.length > 150) return 'text-2xl';
    if (text.length > 100) return 'text-3xl';
    return 'text-4xl';
  };

  return (
    <div
      style={{
        borderWidth: "5px",
        borderRadius: "0 25% 0 25%"
      }}
      className="relative border-black dark:border-[rgba(255,255,255,0.2)] bg-white dark:bg-transparent p-8 col-span-2 hover:opacity-90 w-[100%] h-[100%]"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className={cn("text-2xl font-medium text-gray-800 dark:text-white",gochiHand.className)}>
          Quote of the Day
        </h3>
      </div>

      <div className="overflow-y-auto h-[200px] mt-6 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <style jsx global>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
        <AnimatePresence mode="wait">
          {quote && (
            <div key={quote.content} className="space-y-4 ">
              <div className="flex flex-wrap gap-x-2 ">
                {quote.content.split(' ').map((word, index) => (
                  <motion.span
                    key={index}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ 
                      duration: 0.5,
                      delay: index * 0.1,
                      ease: [0.4, 0.0, 0.2, 1]
                    }}
                    className={cn(
                      gochiHand.className,
                      calculateFontSize(quote.content),
                      "text-gray-800 dark:text-white leading-relaxed"
                    )}
                  >
                    {word}
                  </motion.span>
                ))}
              </div>
              
              <motion.p
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ 
                  duration: 0.5, 
                  delay: quote.content.split(' ').length * 0.1 
                }}
                className="text-right text-gray-600 dark:text-gray-300 italic"
              >
                - {quote.author}
              </motion.p>
            </div>
          )}
        </AnimatePresence>
      </div>


      <Button
          variant="outline"
          size="icon"
          className="rounded-full"
          onClick={fetchQuote}
          disabled={loading}
        >
          <RefreshCcw className={cn("h-4 w-4", loading && "animate-spin")} />
        </Button>
    </div>
  );
}