"use client"

import axios from 'axios';
import * as z from "zod";
import { Heading } from "@/components/heading";
import { LoaderPinwheel, Music, Send } from "lucide-react";
import { useForm } from "react-hook-form";

import { formSchema } from "./constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Empty } from '@/components/empty';
import { useProModal } from '@/hooks/use-pro-modal';
import toast from 'react-hot-toast';

const MusicPage = () => {
  const proModal = useProModal();

  const router = useRouter();
  const [music, setMusic] = useState<string | null>(null);
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
  }, [music, isLoading])

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {

      setMusic(null)
      const {data} = await axios.post("/api/music", values);
      setMusic(data.output)
      scrollToBottom();
      form.reset();

    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) {
          proModal.onOpen();
        } else {
          toast.error("Something went wrong");
        }
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      router.refresh();
    }
  }



  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">
      <div className="px-4 lg:px-8 lg:relative -top-10 pb-2 shadow-md">
        <Heading
          title="Music Generation"
          description="Turn your prompt into music."
          icon={Music}
          iconColor="text-emerald-500"
          bgColor="text-emerald-500/10"
        />
      </div>

      <div className="flex-1 overflow-y-auto px-4 lg:px-8 pb-20">
        {!music && !isLoading && (
          <div className="h-full flex items-center justify-center">
            <Empty label="No music generated" />
          </div>
        )}
        {
          music && (
            <audio
              controls
              className="w-full mt-8"
            >
              <source src={music} type='audio/mpeg'/>
              Your browser does not support the audio element.
            </audio>
          )
        }

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
                      placeholder="Piano solo in the style of Chopin"
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

export default MusicPage;