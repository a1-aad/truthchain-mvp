import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { ShieldCheck, Upload, Database, Link2, FileText, Image, Video, Copy, Check, Loader2, CloudUpload } from "lucide-react";
import type { NewsRecord } from "@shared/schema";

export default function HomePage() {
  const [newsText, setNewsText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [copiedField, setCopiedField] = useState<string>("");
  const { toast } = useToast();

  const { data: records = [], isLoading: recordsLoading } = useQuery<NewsRecord[]>({
    queryKey: ["/api/records"],
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      setUploadProgress("Uploading to IPFS...");
      const response = await apiRequest("POST", "/api/upload", formData);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/records"] });
      setNewsText("");
      setSelectedFile(null);
      setUploadProgress("");
      toast({
        title: "Success!",
        description: "News verified and recorded on blockchain",
      });
    },
    onError: (error: Error) => {
      setUploadProgress("");
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error.message,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsText.trim() || !selectedFile) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please provide both text and a file",
      });
      return;
    }

    const formData = new FormData();
    formData.append("text", newsText);
    formData.append("file", selectedFile);

    uploadMutation.mutate(formData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/png", "image/gif", "video/mp4", "video/webm"];
      if (!validTypes.includes(file.type)) {
        toast({
          variant: "destructive",
          title: "Invalid File Type",
          description: "Please upload an image (JPG, PNG, GIF) or video (MP4, WebM)",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(""), 2000);
    toast({
      description: "Copied to clipboard",
    });
  };

  const truncate = (str: string, length: number) => {
    return str.length > length ? `${str.substring(0, length)}...` : str;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <ShieldCheck className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold tracking-tight">TruthChain</h1>
          </div>
          <p className="text-center text-muted-foreground">Decentralized News Verification on Polygon</p>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-semibold mb-4">Verify News with Blockchain Technology</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Upload news content with media files. We store it on IPFS, generate cryptographic hashes, and permanently record verification on the Polygon blockchain.
          </p>
          <div className="flex items-center justify-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-primary" />
              <span className="font-medium">{records.length} Records Verified</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Powered by</span>
              <Badge variant="outline" className="font-mono">Polygon</Badge>
              <span className="text-muted-foreground">+</span>
              <Badge variant="outline" className="font-mono">IPFS</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Upload Section */}
      <section className="py-12">
        <div className="max-w-2xl mx-auto px-6">
          <Card data-testid="card-upload-form">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CloudUpload className="w-5 h-5 text-primary" />
                <CardTitle>Submit News for Verification</CardTitle>
              </div>
              <CardDescription>Upload news content with supporting media to create an immutable record</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="text-input" className="text-sm font-medium uppercase tracking-wide">News Text</Label>
                  <Textarea
                    id="text-input"
                    data-testid="input-news-text"
                    placeholder="Enter the news content you want to verify..."
                    value={newsText}
                    onChange={(e) => setNewsText(e.target.value)}
                    rows={5}
                    className="resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="file-input" className="text-sm font-medium uppercase tracking-wide">Media File</Label>
                  <div className="border-2 border-dashed rounded-lg p-8 text-center hover-elevate transition-colors">
                    <Input
                      id="file-input"
                      data-testid="input-file"
                      type="file"
                      accept="image/jpeg,image/png,image/gif,video/mp4,video/webm"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label htmlFor="file-input" className="cursor-pointer">
                      <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                      <p className="font-medium mb-1">
                        {selectedFile ? selectedFile.name : "Drop media file here or click to browse"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Images: JPG, PNG, GIF | Video: MP4, WebM
                      </p>
                    </label>
                  </div>
                </div>

                {uploadProgress && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{uploadProgress}</span>
                    </div>
                    <Progress value={uploadProgress === "Uploading to IPFS..." ? 50 : 100} />
                  </div>
                )}

                <Button
                  type="submit"
                  data-testid="button-submit"
                  disabled={uploadMutation.isPending}
                  className="w-full"
                >
                  {uploadMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 mr-2" />
                      Verify & Submit
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Records Section */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-6">
          <Card data-testid="card-records">
            <CardHeader>
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <CardTitle>Verified News Records</CardTitle>
                </div>
                <Badge variant="secondary" data-testid="badge-record-count">
                  {records.length} {records.length === 1 ? "Record" : "Records"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {recordsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : records.length === 0 ? (
                <div className="text-center py-12">
                  <ShieldCheck className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground font-medium">No records yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Submit your first news verification above</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>News Text</TableHead>
                        <TableHead>Media</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Verification Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {records.map((record) => (
                        <TableRow key={record.id} data-testid={`row-record-${record.id}`} className="hover-elevate">
                          <TableCell className="whitespace-nowrap">
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(record.createdAt), { addSuffix: true })}
                            </span>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <p className="truncate" title={record.text}>
                              {truncate(record.text, 60)}
                            </p>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {record.fileType?.startsWith("image/") ? (
                                <Image className="w-4 h-4 text-muted-foreground" />
                              ) : (
                                <Video className="w-4 h-4 text-muted-foreground" />
                              )}
                              <span className="text-xs text-muted-foreground">{record.fileName}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="default" className="gap-1">
                              <ShieldCheck className="w-3 h-3" />
                              Verified
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">IPFS:</span>
                                <code className="text-xs font-mono bg-muted px-1 py-0.5 rounded">
                                  {truncate(record.cid, 12)}
                                </code>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => copyToClipboard(record.cid, `cid-${record.id}`)}
                                  data-testid={`button-copy-cid-${record.id}`}
                                >
                                  {copiedField === `cid-${record.id}` ? (
                                    <Check className="w-3 h-3" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </Button>
                              </div>
                              {record.tx && (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground">TX:</span>
                                  <code className="text-xs font-mono bg-muted px-1 py-0.5 rounded">
                                    {truncate(record.tx, 12)}
                                  </code>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => copyToClipboard(record.tx!, `tx-${record.id}`)}
                                    data-testid={`button-copy-tx-${record.id}`}
                                  >
                                    {copiedField === `tx-${record.id}` ? (
                                      <Check className="w-3 h-3" />
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                  </Button>
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">Hash:</span>
                                <code className="text-xs font-mono bg-muted px-1 py-0.5 rounded">
                                  {truncate(record.hash, 12)}
                                </code>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => copyToClipboard(record.hash, `hash-${record.id}`)}
                                  data-testid={`button-copy-hash-${record.id}`}
                                >
                                  {copiedField === `hash-${record.id}` ? (
                                    <Check className="w-3 h-3" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 mt-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <a href="https://github.com" className="hover:text-foreground transition-colors" data-testid="link-github">
                GitHub
              </a>
              <span>•</span>
              <span>MIT License</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Built with</span>
              <Badge variant="outline" className="font-mono">Polygon</Badge>
              <span>+</span>
              <Badge variant="outline" className="font-mono">IPFS</Badge>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
