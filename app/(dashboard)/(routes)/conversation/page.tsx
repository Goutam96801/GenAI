"use client"

import axios from 'axios';
import * as z from "zod";
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import {toast} from 'react-hot-toast';

import { Heading } from "@/components/heading";
import { 
  LoaderPinwheel, 
  MessageSquare, 
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
import { Empty } from '@/components/empty';
import { cn } from '@/lib/utils';
import Markdown from 'react-markdown';
import { UserAvatar } from '@/components/user-avatar';
import { BotAvatar } from '@/components/bot-avatar';

type Message = {
  role: "user" | "model";
  content: string;
};

const ConversationPage = () => {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: ""
    }
  });

  const isLoading = form.formState.isSubmitting;

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isLoading])

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    
    try {
      const userMessage: Message = {
        role: "user",
        content: values.prompt,
      }
      const messagesToSend = [...messages, userMessage];

      // setMessages(current => [...current, userMessage]);

      const response = await axios.post<{ role: 'model'; content: string }>("/api/conversation", {
        messages: messagesToSend,
      });

      const aiMessage: Message = response.data;
      setMessages((current) => [...current, userMessage, aiMessage]);
      setTimeout(scrollToBottom, 100)

      form.reset();

    } catch {
      toast.error("Something went wrong");
    }
    finally {
      router.refresh();
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">
      <div className="px-4 lg:px-8 lg:relative -top-10 pb-2 shadow-md">
        <Heading
          title="Conversation"
          description="Our most advanced conversation model."
          icon={MessageSquare}
          iconColor="text-violet-500"
          bgColor="text-violet-500/10"
        />
      </div>

      <div className="flex-1 overflow-y-auto px-4 lg:px-8 pb-20">
        {messages.length === 0 && !isLoading ? (
          <div className="h-full flex items-center justify-center">
            <Empty label="No conversation started" />
          </div>
        ) : (
          <div className="space-y-6 pt-4">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "flex items-start gap-x-2 max-w-[80%]",
                    message.role === "user" ? "flex-row-reverse" : "flex-row",
                  )}
                >
                  {message.role === "user" ? <UserAvatar /> : <BotAvatar />}
                  <div
                    className={cn(
                      "p-3 rounded-lg",
                      message.role === "user"
                        ? "bg-violet-500 text-white rounded-tr-none"
                        : "bg-gray-200 text-gray-900 rounded-tl-none",
                    )}
                  >
                    <Markdown>
                      {message.content}
                      </Markdown>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start gap-x-2 pl-2.5">
                  <LoaderPinwheel className='animate-spin w-5 h-5 my-auto' />
                  <div className="p-2 rounded-lg bg-gray-200  rounded-tl-none text-muted-foreground flex items-center gap-2 ">
                    <span>GenAI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className=" bottom-0 left-0 right-0 bg-white border-t p-2">
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
                      className="border-0 shadow-none outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                      disabled={isLoading}
                      placeholder="Type your message here..."
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
  )
}

export default ConversationPage;