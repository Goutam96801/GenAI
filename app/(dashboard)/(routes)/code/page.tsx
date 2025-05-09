"use client"

import axios from 'axios';
import * as z from "zod";
import { useEffect, useRef, useState } from 'react';

import { Heading } from "@/components/heading";
import { 
  Code, 
  CopyIcon, 
  LoaderPinwheel, 
  Send 
} from "lucide-react";
import { useForm } from "react-hook-form";
import { formSchema } from "./constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { Empty } from '@/components/empty';
import { cn } from '@/lib/utils';
import { UserAvatar } from '@/components/user-avatar';
import { BotAvatar } from '@/components/bot-avatar';
import Markdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";

// Define the message type
type Message = {
  role: "user" | "model";
  content: string;
};

const CodePage = () => {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [copiedStates, setCopiedStates] = useState<Record<number, boolean>>({});

  useEffect(() => {
    // Highlight all code blocks on message update
    import("prismjs").then(({ default: Prism }) => {
      Prism.highlightAll();
    });
  }, [messages]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { prompt: "" },
  });

  const isLoading = form.formState.isSubmitting;

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const userMessage: Message = { role: "user", content: values.prompt };
      const messagesToSend = [...messages, userMessage];

      const response = await axios.post< Message >(
        "/api/code",
        { messages: messagesToSend }
      );

      const aiMessage = response.data;
      setMessages((current) => [...current, userMessage, aiMessage]);
      setTimeout(scrollToBottom, 100);
      form.reset();
    } catch (error: unknown) {
      console.error("API Call Error:", error);
    } finally {
      router.refresh();
    }
  };

  const handleCopy = (codeContent: string, index: number) => {
    navigator.clipboard.writeText(codeContent);
    setCopiedStates((prev) => ({ ...prev, [index]: true }));
    setTimeout(() => {
      setCopiedStates((prev) => ({ ...prev, [index]: false }));
    }, 2000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">
      <div className="px-4 lg:px-8 pb-2 lg:relative -top-10 shadow-md">
        <Heading
          title="Code Generation"
          description="Generate code using descriptive text."
          icon={Code}
          iconColor="text-green-700"
          bgColor="text-green-700/10"
        />
      </div>

      <div className="flex-1 overflow-y-auto px-4 lg:px-8 pb-20">
        {messages.length === 0 && !isLoading ? (
          <div className="h-full flex items-center justify-center">
            <Empty label="No code generated" />
          </div>
        ) : (
          <div className="space-y-6 pt-4">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={cn(
                  "flex",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "flex items-start gap-x-2 max-w-[80%]",
                    message.role === "user" ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  {message.role === "user" ? <UserAvatar /> : <BotAvatar />}
                  <div
                    className={cn(
                      "p-3 rounded-lg",
                      message.role === "user"
                        ? "bg-violet-500 text-white rounded-tr-none"
                        : "bg-transparent text-gray-900 rounded-tl-none overflow-visible!"
                    )}
                  >
                    <div className="space-y-4 w-full">
                      <Markdown
                        components={{
                          code({ className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || "");
                            const codeContent = String(children).replace(/\n$/, "");
                            const copied = copiedStates[index] || false;

                            if (match) {
                              return (
                                <div className="relative w-full my-4 max-w-full">
                                  <div className="flex justify-between items-center bg-gray-700 px-4 py-2 text-sm w-full rounded-tl-lg rounded-tr-lg">
                                    <span className="text-white/80">{match[1]}</span>
                                    <button
                                      onClick={() => handleCopy(codeContent, index)}
                                      className="flex items-center gap-1 text-white/80 hover:text-white transition-colors"
                                    >
                                      {copied ? (
                                        <span className="text-sm">✓ Copied</span>
                                      ) : (
                                        <div className="flex items-center gap-1 cursor-pointer">
                                          <CopyIcon className="w-4 h-4" />
                                          <span className="text-sm">Copy</span>
                                        </div>
                                      )}
                                    </button>
                                  </div>
                                  <SyntaxHighlighter
                                    language={match[1]}
                                    // @ts-ignore
                                    style={atomDark}
                                    customStyle={{
                                      margin: 0,
                                      background: "#1d1f21",
                                      width: "100%",
                                      padding: "1rem",
                                      borderTopLeftRadius: "0",
                                      borderTopRightRadius: "0",
                                      borderRadius: "0",
                                      overflowX: "auto",
                                      maxWidth: "100%",
                                    }}
                                    {...props}
                                  >
                                    {codeContent}
                                  </SyntaxHighlighter>
                                </div>
                              );
                            }

                            return (
                              <code className={className} {...props}>
                                {children}
                              </code>
                            );
                          },
                          pre({ children }) {
                            return <div className="w-full">{children}</div>;
                          },
                        }}
                      >
                        {message.content}
                      </Markdown>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start gap-x-2 pl-2.5">
                  <LoaderPinwheel className="animate-spin w-5 h-5 my-auto" />
                  <div className="p-2 rounded-lg bg-gray-200 rounded-tl-none text-muted-foreground flex items-center gap-2">
                    <span>GenAI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="bottom-0 left-0 right-0 bg-white border-t p-2">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="rounded-lg border w-full p-2 px-3 md:px-4 focus-within:shadow-sm flex items-center gap-2 max-w-4xl mx-auto"
          >
            <FormField
              name="prompt"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl className="m-0 p-0">
                    <Input
                      className="border-0 outline-none shadow-none focus-visible:ring-0 focus-visible:ring-transparent"
                      disabled={isLoading}
                      placeholder="Simple toggle button using react hooks."
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button
              size="icon"
              type="submit"
              disabled={isLoading}
              className="rounded-full h-10 w-10 p-0 flex items-center justify-center"
            >
              {isLoading ? <LoaderPinwheel className='animate-spin ' /> : <Send className="h-5 w-5" />}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CodePage;
