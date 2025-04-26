
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Send, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const ImageProcessor = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [prompt, setPrompt] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [responseImage, setResponseImage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedImage || !prompt || !webhookUrl) {
      toast.error("Please provide an image, prompt, and webhook URL");
      return;
    }

    setIsLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append('image', selectedImage);
    formData.append('prompt', prompt);

    try {
      console.log("Sending request to:", webhookUrl);
      
      // Check if the webhook URL is a localhost URL
      const isLocalhost = webhookUrl.includes('localhost') || webhookUrl.includes('127.0.0.1');
      
      if (isLocalhost) {
        setError(`Connection to ${webhookUrl} failed. Your browser cannot connect to localhost from a deployed application due to CORS restrictions. 
        Please either:
        1. Deploy your n8n instance and use that URL instead
        2. Use a CORS proxy service
        3. Test this app locally on your machine
        
        Important: Make sure to enable CORS on your n8n Webhook node!`);
        
        // Simulate a response for testing purposes
        setTimeout(() => {
          setResponseImage(imagePreview);
          toast.info("Using preview image as simulated response for testing");
        }, 1000);
      } else {
        // Use regular fetch with proper response handling
        const response = await fetch(webhookUrl, {
          method: 'POST',
          body: formData,
        });

        console.log("Response received");
        
        // Parse the JSON response from n8n
        if (response.ok) {
          const data = await response.json();
          console.log("Parsed response data:", data);
          
          // Set the image URL from the response
          if (data && data.image_url) {
            setResponseImage(data.image_url);
            toast.success("Image processed successfully!");
          } else {
            throw new Error("Response did not contain an image URL");
          }
        } else {
          throw new Error(`HTTP error: ${response.status}`);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setError(`Failed to process image: ${error instanceof Error ? error.message : 'Unknown error'}`);
      toast.error("Failed to process image");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="p-6 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">GPT Image Processor</h1>
          <p className="text-gray-600">Upload an image, add a prompt, and process with GPT</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className="whitespace-pre-line">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">n8n Webhook URL</label>
            <Input
              type="url"
              placeholder="Enter your n8n webhook URL"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              required
            />
            {webhookUrl.includes('localhost') && (
              <p className="text-amber-600 text-xs mt-1">
                ⚠️ Using localhost URLs may not work from deployed applications due to CORS restrictions
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Upload Image</label>
            <div className="border-2 border-dashed rounded-lg p-4 text-center">
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
                required
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer flex flex-col items-center space-y-2"
              >
                <Upload className="h-8 w-8 text-gray-400" />
                <span className="text-sm text-gray-500">Click to upload image</span>
              </label>
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="mt-4 max-h-48 mx-auto rounded"
                />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Prompt</label>
            <Textarea
              placeholder="Enter your prompt for GPT..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              required
              className="min-h-[100px]"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              "Processing..."
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" /> Process Image
              </>
            )}
          </Button>
        </form>

        {responseImage && (
          <div className="space-y-2">
            <h2 className="text-lg font-medium">Result</h2>
            <div className="border rounded-lg p-4">
              <img
                src={responseImage}
                alt="Processed"
                className="max-h-96 mx-auto rounded"
              />
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ImageProcessor;
