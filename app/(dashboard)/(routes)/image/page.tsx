"use client"

import axios from 'axios';
import * as z from "zod";

import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Heading } from "@/components/heading";
import { 
  Download, 
  ImageIcon, 
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
import { Empty } from '@/components/empty';
import { cn } from '@/lib/utils';
import { UserAvatar } from '@/components/user-avatar';
import { BotAvatar } from '@/components/bot-avatar';

import { 
  Card, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';


type ImageApiResponse = {
  data: {
    candidates?: Array<{
      content?: {
        parts?: Array<
          | { text: string }
          | { inlineData: { mimeType: string; data: string } }
        >;
      };
    }>;
  };
};


const ImagePage = () => {
  const router = useRouter();
  const [images, setImages] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [lastPrompt, setLastPrompt] = useState<string>("");

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
  }, [images, isLoading])


  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {

      setLastPrompt(values.prompt);

      const response = await axios.post<ImageApiResponse["data"]>("/api/image", values);

      const extractedImages: string[] = [];
      const candidates = response.data.candidates;

      if (candidates && candidates.length > 0) {
        const parts = candidates[0].content?.parts;

        if (parts && parts.length > 0) {
          // Find the part containing inline image data
          const imagePart = parts.find(
            (part): part is { inlineData: { mimeType: string; data: string } } =>
              'inlineData' in part && typeof part.inlineData?.data === 'string' && typeof part.inlineData?.mimeType === 'string'
          );

          if (imagePart) {
            const mimeType = imagePart.inlineData.mimeType;
            const base64Data = imagePart.inlineData.data;
            const imageUrl = `data:${mimeType};base64,${base64Data}`;
            extractedImages.push(imageUrl);
          } else {
            toast.error("Something went wrong")
          }
        } else {
          toast.error("Something went wrong")
        }
      } else {
        toast.error("Something went wrong")
      }
      setImages(extractedImages);

      form.reset();

    } catch {
      toast.error("Something went wrong");
    }finally {
      router.refresh();
    }
  }


const downloadImage = (dataUrl: string, filename = 'generated-image.png') => {

  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename; 
  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);
};

  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">
      <div className="px-4 lg:px-8 lg:relative -top-10 shadow-md pb-2">
        <Heading
          title="Image Generation"
          description="Type your prompt to generate an image"
          icon={ImageIcon}
          iconColor="text-pink-700"
          bgColor="text-pink-700/10"
        />
      </div>

      <div className="flex-1 overflow-y-auto px-4 lg:px-8 pb-20">



        {!isLoading && images.length === 0 && (
          <div className="h-full flex items-center justify-center">
            <Empty label="No image generated yet." />
          </div>
        )}

        {!isLoading && images.length > 0 && (
          <div className="space-y-6">
           {lastPrompt && (
              <div className="flex justify-end">
                <div className='flex items-start gap-x-2 max-w-[80%] flex-row-reverse'>
                  <UserAvatar />
                  <div
                    className={cn(
                      "p-3 rounded-lg",
                      "bg-violet-500 text-white rounded-tr-none"
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{lastPrompt}</p>
                  </div>
                </div>
              </div>
            )}
            <div className="max-w-[80%]">
              {images.map((src) => {
                const filename = `generated-${lastPrompt ? lastPrompt.slice(0, 20).replace(/\s+/g, '_') : 'image'}-${Date.now()}.png`;

                return (
                <div key={src} className="flex flex-col items-start gap-y-2"> {/* Use flex column */}
                  <BotAvatar />
                  <Card className="w-full overflow-hidden">
                    <CardContent className="p-0">
                      <div className="relative w-full h-[400px]">
                        <Image
                          src={src}
                          alt="Generated image"
                          fill
                          className="object-contain"
                        />
                        {isLoading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                            <p>Loading image...</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className='p-2'>
                      <Button
                        onClick={() => downloadImage(src, filename)}
                        variant="secondary"
                        className='w-[60%] cursor-pointer mx-auto'
                        size="sm" // Slightly smaller button
                      >
                        <Download className='h-4 w-4 mr-2' />
                        Download
                      </Button>
                    </CardFooter>
                  </Card>
                
                </div>
)})}
            </div>
          </div>
        )}

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
                      className="border-0 outline-none shadow-none focus-visible:ring-0 focus-visible:ring-transparent"
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

export default ImagePage;