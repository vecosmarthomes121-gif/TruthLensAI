import { useState } from 'react';
import { Search, Link as LinkIcon, Image, Video, Loader2, Upload, X } from 'lucide-react';
import { InputType } from '@/types';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface VerificationInputProps {
  onVerify: (input: string, type: InputType, mediaUrl?: string) => void;
  isLoading?: boolean;
}

export default function VerificationInput({ onVerify, isLoading }: VerificationInputProps) {
  const [activeTab, setActiveTab] = useState<InputType>('text');
  const [input, setInput] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('verification-media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('verification-media')
        .getPublicUrl(filePath);

      setUploadedFileUrl(publicUrl);
      setUploadedFile(file);
      toast.success('File uploaded successfully!');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setUploadedFileUrl('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (activeTab === 'image' || activeTab === 'video') {
      // For image/video, use uploaded file URL or pasted URL
      const mediaUrl = uploadedFileUrl || input.trim();
      if (mediaUrl && !isLoading) {
        onVerify(mediaUrl, activeTab, mediaUrl);
      }
    } else {
      // For text/url, just use input
      if (input.trim() && !isLoading) {
        onVerify(input.trim(), activeTab);
      }
    }
  };

  const tabs = [
    { id: 'text' as InputType, label: 'Text Claim', icon: Search },
    { id: 'url' as InputType, label: 'URL', icon: LinkIcon },
    { id: 'image' as InputType, label: 'Image', icon: Image },
    { id: 'video' as InputType, label: 'Video', icon: Video },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Tab Navigation */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all",
                activeTab === tab.id
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          {activeTab === 'text' && (
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter a claim to verify (e.g., 'China bans electric cars in Europe')"
              className="w-full min-h-[120px] px-4 py-3 rounded-lg border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-blue-600"
              disabled={isLoading}
            />
          )}
          {activeTab === 'url' && (
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste news article URL (e.g., https://example.com/news/article)"
              className="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-blue-600"
              disabled={isLoading}
            />
          )}
          {activeTab === 'image' && (
            <div className="border-2 border-dashed rounded-lg p-8 text-center bg-muted/30">
              {uploadedFile ? (
                <div className="relative">
                  <img 
                    src={uploadedFileUrl} 
                    alt="Uploaded" 
                    className="max-h-64 mx-auto rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <p className="text-sm text-muted-foreground mt-3">{uploadedFile.name}</p>
                </div>
              ) : (
                <>
                  <Image className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-4">Upload an image to verify</p>
                  <label className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors">
                    <Upload className="h-4 w-4" />
                    {uploading ? 'Uploading...' : 'Choose Image'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                      disabled={uploading || isLoading}
                    />
                  </label>
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-muted/30 px-2 text-muted-foreground">or</span>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Paste image URL"
                    className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-blue-600"
                    disabled={isLoading}
                  />
                </>
              )}
            </div>
          )}
          {activeTab === 'video' && (
            <div className="border-2 border-dashed rounded-lg p-8 text-center bg-muted/30">
              {uploadedFile ? (
                <div className="relative">
                  <video 
                    src={uploadedFileUrl} 
                    controls
                    className="max-h-64 mx-auto rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <p className="text-sm text-muted-foreground mt-3">{uploadedFile.name}</p>
                </div>
              ) : (
                <>
                  <Video className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-4">Upload a video or paste YouTube/TikTok URL</p>
                  <label className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors">
                    <Upload className="h-4 w-4" />
                    {uploading ? 'Uploading...' : 'Choose Video'}
                    <input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                      disabled={uploading || isLoading}
                    />
                  </label>
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-muted/30 px-2 text-muted-foreground">or</span>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Paste YouTube or TikTok URL"
                    className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-blue-600"
                    disabled={isLoading}
                  />
                </>
              )}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={(activeTab === 'image' || activeTab === 'video' ? !uploadedFileUrl && !input.trim() : !input.trim()) || isLoading || uploading}
          className="mt-4 w-full px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Analyzing with AI...
            </>
          ) : (
            <>
              <Search className="h-5 w-5" />
              Verify Now
            </>
          )}
        </button>
      </form>
    </div>
  );
}
