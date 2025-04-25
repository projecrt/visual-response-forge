
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Send } from "lucide-react";
import { toast } from "sonner";

const ImageProcessor = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [prompt, setPrompt] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [responseImage, setResponseImage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

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
    const formData = new FormData();
    formData.append('image', selectedImage);
    formData.append('prompt', prompt);

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        body: formData,
        mode: 'no-cors', // Handle CORS issues
      });

      // Since we're using no-cors, simulate success
      // In a real app, handle the actual response from n8n
      toast.success("Request sent successfully!");
      
      // For demo purposes, we'll just show the input image as response
      // In reality, you'd handle the actual response image from n8n
      setResponseImage(imagePreview);
    } catch (error) {
      console.error('Error:', error);
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
