import React, { useState, useEffect } from "react";
import { Award, PlusCircle, Pencil, Trash2, FileText, ChevronDown, X, Search } from "lucide-react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PostFile {
  id: string;
  name: string;
  type: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  date: string;
  lastUpdated?: string;
  tags?: string[];
  files?: PostFile[];
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  publicMetadata?: {
    role?: string;
    hours?: string;
    committee?: string;
  };
}

interface PostFormData {
  title: string;
  content: string;
  tags: string[];
  files: { name: string; content: string; type: string }[];
  existingFiles?: PostFile[];
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

const MarkdownRenderer = ({ content }: { content: string }) => {
  const [html, setHtml] = useState('');

  useEffect(() => {
    import('marked').then(({ marked }) => {
      const rendered = marked(content || '');
      if (typeof rendered === 'string') {
        setHtml(rendered);
      } else {
        rendered.then(result => setHtml(result));
      }
    });
  }, [content]);

  return (
    <div
      className="prose prose-green max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

const PostPreview = ({ post, onView }: { post: Post; onView: (post: Post) => void }) => {
  const previewText = post.content.substring(0, 150) + (post.content.length > 150 ? '...' : '');
  
  return (
    <Card className="w-full mb-4 hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle>{post.title}</CardTitle>
        <CardDescription>
          By {post.authorName} on {formatDate(post.date)}
          <div className="flex flex-wrap gap-1 mt-2">
            {post.tags?.map((tag: string, index: number) => (
              <Badge key={index} variant="outline">{tag}</Badge>
            ))}
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700">{previewText}</p>
        {post.files && post.files.length > 0 && (
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              {post.files.length} file{post.files.length !== 1 ? 's' : ''} attached
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={() => onView(post)}>Read More</Button>
      </CardFooter>
    </Card>
  );
};

const PostView = ({ post, onClose }: { post: Post; onClose: () => void }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{post.title}</h2>
        <Button variant="outline" size="sm" onClick={onClose}>
          <X className="h-4 w-4 text-red-500" />
        </Button>
      </div>
      
      <div className="text-gray-600 mb-2">
        By {post.authorName} on {formatDate(post.date)}
        {post.lastUpdated && (
          <span className="ml-2 text-sm italic">
            (Updated: {formatDate(post.lastUpdated)})
          </span>
        )}
      </div>
      
      <div className="flex flex-wrap gap-1 mb-4">
        {post.tags?.map((tag: string, index: number) => (
          <Badge key={index} variant="outline">{tag}</Badge>
        ))}
      </div>
      
      <div className="prose prose-green max-w-none mb-6">
        <MarkdownRenderer content={post.content} />
      </div>
      
      {post.files && post.files.length > 0 && (
        <div className="border-t pt-4 mt-4">
          <h3 className="text-lg font-medium mb-2">Attachments</h3>
          <div className="flex flex-wrap gap-2">
            {post.files.map((file: PostFile) => (
              <a
                key={file.id}
                href={`/api/v1/newsletter/getFile?id=${file.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200"
              >
                <FileText className="h-4 w-4 mr-2" />
                {file.name}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const PostEditor = ({ 
  post, 
  isOpen, 
  onClose, 
  onSave 
}: { 
  post?: Post | null; 
  isOpen: boolean; 
  onClose: () => void; 
  onSave: (data: PostFormData) => Promise<void>; 
}) => {
  const [title, setTitle] = useState(post?.title || '');
  const [content, setContent] = useState(post?.content || '');
  const [tags, setTags] = useState(post?.tags?.join(', ') || '');
  const [files, setFiles] = useState<File[]>([]);
  const [existingFiles, setExistingFiles] = useState<PostFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useUser();
  
  useEffect(() => {
    if (post) {
      setTitle(post.title || '');
      setContent(post.content || '');
      setTags(post.tags?.join(', ') || '');
      setExistingFiles(post.files || []);
    } else {
      setTitle('');
      setContent('');
      setTags('');
      setExistingFiles([]);
    }
    setFiles([]);
  }, [post, isOpen]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
    setFiles(selectedFiles);
  };
  
  const handleRemoveExistingFile = (fileId: string) => {
    setExistingFiles(existingFiles.filter(file => file.id !== fileId));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      return;
    }
    
    setIsSubmitting(true);
    
    const fileData = [];
    for (const file of files) {
      const reader = new FileReader();
      const filePromise = new Promise<{ name: string; content: string; type: string }>(resolve => {
        reader.onload = (e) => {
          resolve({
            name: file.name,
            content: e.target?.result as string,
            type: file.type
          });
        };
        reader.readAsDataURL(file);
      });
      
      fileData.push(await filePromise);
    }
    
    const postData: PostFormData = {
      title,
      content,
      tags: tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag),
      files: fileData,
      existingFiles: existingFiles
    };
    
    await onSave(postData);
    setIsSubmitting(false);
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-black">{post ? 'Edit Post' : 'Create New Post'}</DialogTitle>
          <DialogDescription className="text-gray-600">
            {post ? 'Edit your newsletter post below.' : 'Create a new newsletter post.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-black">Title</Label>
            <Input
              id="title"
              placeholder="Post title"
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="content" className="text-black">Content (Markdown supported)</Label>
            <Textarea
              id="content"
              placeholder="Write your post content..."
              value={content}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
              className="min-h-[200px]"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="tags" className="text-black">Tags (comma-separated)</Label>
            <Input
              id="tags"
              placeholder="event, announcement, news"
              value={tags}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTags(e.target.value)}
            />
          </div>
          
          {existingFiles.length > 0 && (
            <div>
              <Label className="text-black">Existing Files</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {existingFiles.map((file) => (
                  <div 
                    key={file.id}
                    className="flex items-center bg-gray-100 rounded-full px-3 py-1"
                  >
                    <FileText className="h-4 w-4 mr-2 text-gray-700" />
                    <span className="mr-2 text-gray-700">{file.name}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-5 w-5 p-0 rounded-full border border-gray-300"
                      onClick={() => handleRemoveExistingFile(file.id)}
                    >
                      <X className="h-3 w-3 text-gray-700" />
                      <span className="sr-only">Remove {file.name}</span>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div>
            <Label htmlFor="files" className="text-black">Attach Files</Label>
            <Input
              id="files"
              type="file"
              onChange={handleFileChange}
              multiple
              className="cursor-pointer"
            />
            {files.length > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                {files.length} file{files.length !== 1 ? 's' : ''} selected
              </p>
            )}
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : post ? 'Update Post' : 'Create Post'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const DeleteConfirmation = ({ 
  post, 
  isOpen, 
  onClose, 
  onConfirm 
}: { 
  post?: Post | null; 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: (post: Post) => Promise<void>; 
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleDelete = async () => {
    if (!post) return;
    
    setIsDeleting(true);
    await onConfirm(post);
    setIsDeleting(false);
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-black">Delete Post</DialogTitle>
          <DialogDescription className="text-gray-600">
            Are you sure you want to delete "{post?.title}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const UserSearch = ({ 
  users, 
  onSelectUser,
  onClearSearch
}: { 
  users: User[]; 
  onSelectUser: (userId: string) => void;
  onClearSearch: () => void;
}) => {
  const [search, setSearch] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = React.useRef<HTMLDivElement>(null);
  
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchRef]);
  
  useEffect(() => {
    console.log("UserSearch component received users:", users);
    console.log("User count:", users?.length || 0);
  }, [users]);
  
  useEffect(() => {
    if (!search.trim()) {
      setFilteredUsers(users?.slice(0, 100) || []);
    } else {
      const filtered = users?.filter((user: User) => 
        `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase().includes(search.toLowerCase()) ||
        (user.publicMetadata?.role && user.publicMetadata.role.toLowerCase().includes(search.toLowerCase())) ||
        (user.publicMetadata?.committee && user.publicMetadata.committee.toLowerCase().includes(search.toLowerCase()))
      ).slice(0, 100) || [];
      setFilteredUsers(filtered);
    }
  }, [search, users]);
  
  const handleSelectUser = (userId: string, userName: string) => {
    onSelectUser(userId);
    setSearch(userName);
    setIsOpen(false);
  };
  
  return (
    <div className="mb-4 relative" ref={searchRef}>
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Search users by name, role, or committee..."
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="pl-8 w-full"
        />
        {search && (
          <button
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-200"
            onClick={() => {
              setSearch('');
              setIsOpen(true);
              onClearSearch();
            }}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredUsers.length > 0 ? (
            <ul className="py-1">
              {filteredUsers.map((user: User) => (
                <li 
                  key={user.id}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                  onClick={() => handleSelectUser(user.id, `${user.firstName} ${user.lastName}`)}
                >
                  <div>
                    <span className="font-medium">{user.firstName} {user.lastName}</span>
                    {user.publicMetadata?.role && (
                      <span className="ml-2 text-xs bg-gray-200 text-gray-700 px-1 py-0.5 rounded">
                        {user.publicMetadata.role}
                      </span>
                    )}
                  </div>
                  {user.publicMetadata?.committee && (
                    <span className="text-sm text-gray-500">
                      {user.publicMetadata.committee}
                    </span>
                  )}
                </li>
              ))}
              {users && users.length > filteredUsers.length && (
                <li className="px-4 py-2 text-sm text-gray-500 italic">
                  Showing first 100 results. Refine your search to see more specific results.
                </li>
              )}
            </ul>
          ) : (
            <div className="px-4 py-2 text-sm text-gray-500">
              No users found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const NewsletterManagement = ({ currentUser }: { currentUser?: User }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>(currentUser?.id);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [deletingPost, setDeletingPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isAdmin = currentUser?.publicMetadata?.role === 'admin';
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        const response = await fetch('/api/v1/newsletter/getPostsByUser', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: selectedUserId || currentUser?.id,
            requesterId: currentUser?.id
          }),
        });
        
        if (response.ok) {
          const data = await response.json();
          setPosts(data.posts || []);
        } else {
          console.error('Failed to fetch posts');
        }
        
      if (isAdmin) {
        try {
          const usersResponse = await fetch('/api/v1/users/listUsers');
          
          if (usersResponse.ok) {
            const usersData = await usersResponse.json();
            console.log("Raw users data format:", Array.isArray(usersData) ? "array" : typeof usersData);
            console.log("Users data sample:", usersData && usersData.length > 0 ? usersData[0] : "No users");

            const usersList = Array.isArray(usersData) ? usersData : 
                              (usersData && usersData.data && Array.isArray(usersData.data)) ? usersData.data : [];
            
            const transformedUsers = usersList.map((user: any) => ({
              id: user.id,
              firstName: user.firstName || user.first_name || "",
              lastName: user.lastName || user.last_name || "",
              publicMetadata: user.publicMetadata || user.public_metadata || {}
            }));
            
            console.log("Transformed users:", transformedUsers);
            
            // Filter if needed (currently including all users for debugging)
            const filteredUsers = transformedUsers.filter((user: User) => {
              // Include all users for now to debug
              return true;
              // Uncomment below to filter by role again once debugging is complete
              // return user.publicMetadata?.role === 'admin' || user.publicMetadata?.role === 'lead';
            });
            
            setAllUsers(filteredUsers);
          } else {
            console.error("Failed to fetch users:", await usersResponse.text());
          }
        } catch (error) {
          console.error("Error fetching users:", error);
        }
      }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (currentUser?.id) {
      fetchData();
    }
  }, [currentUser, selectedUserId, isAdmin]);
  
  const handleCreatePost = async (postData: PostFormData) => {
    if (!currentUser?.id) return;
    
    try {
      const response = await fetch('/api/v1/newsletter/createPost', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...postData,
          userId: currentUser.id
        }),
      });
      
      if (response.ok) {
        const newResponse = await fetch('/api/v1/newsletter/getPostsByUser', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: selectedUserId || currentUser?.id,
            requesterId: currentUser?.id
          }),
        });
        
        if (newResponse.ok) {
          const data = await newResponse.json();
          setPosts(data.posts || []);
        }
      } else {
        console.error('Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };
  
  const handleUpdatePost = async (postData: PostFormData) => {
    if (!currentUser?.id || !editingPost) return;
    
    try {
      const response = await fetch('/api/v1/newsletter/updatePost', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...postData,
          userId: currentUser.id,
          postId: editingPost?.id
        }),
      });
      
      if (response.ok) {
        const newResponse = await fetch('/api/v1/newsletter/getPostsByUser', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: selectedUserId || currentUser?.id,
            requesterId: currentUser?.id
          }),
        });
        
        if (newResponse.ok) {
          const data = await newResponse.json();
          setPosts(data.posts || []);
        }
      } else {
        console.error('Failed to update post');
      }
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };
  
  const handleDeletePost = async (post: Post) => {
    if (!currentUser?.id) return;
    
    try {
      const response = await fetch('/api/v1/newsletter/deletePost', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.id,
          postId: post.id
        }),
      });
      
      if (response.ok) {
        setPosts(posts.filter(p => p.id !== post.id));
      } else {
        console.error('Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };
  
  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId);
  };
  
  return (
    <div className="space-y-6 w-full">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Newsletter Management</h2>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Post
        </Button>
      </div>
      
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>View Posts by User</CardTitle>
            <CardDescription>As an admin, you can view and manage posts from all users.</CardDescription>
          </CardHeader>
          <CardContent>
            <UserSearch 
              users={allUsers} 
              onSelectUser={handleSelectUser}
              onClearSearch={() => setSelectedUserId(currentUser?.id)}
            />
          </CardContent>
        </Card>
      )}
      
      {isLoading ? (
        <p>Loading posts...</p>
      ) : posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post: Post) => (
            <Card key={post.id}>
              <CardHeader>
                <CardTitle>{post.title}</CardTitle>
                <CardDescription>
                  {formatDate(post.date)}
                  <div className="flex flex-wrap gap-1 mt-1">
                    {post.tags?.map((tag: string, index: number) => (
                      <Badge key={index} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{post.content.substring(0, 100)}...</p>
                {post.files && post.files.length > 0 && (
                  <p className="text-sm text-gray-500 mt-2">
                    {post.files.length} file{post.files.length !== 1 ? 's' : ''} attached
                  </p>
                )}
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button key={`edit-${post.id}`} variant="outline" size="sm" onClick={() => setEditingPost(post)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button key={`delete-${post.id}`} variant="destructive" size="sm" onClick={() => setDeletingPost(post)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <p>No posts yet. Create your first post!</p>
      )}
      
      <PostEditor
        post={editingPost}
        isOpen={!!editingPost || isCreateDialogOpen}
        onClose={() => {
          setEditingPost(null);
          setIsCreateDialogOpen(false);
        }}
        onSave={editingPost ? handleUpdatePost : handleCreatePost}
      />
      
      <DeleteConfirmation
        post={deletingPost}
        isOpen={!!deletingPost}
        onClose={() => setDeletingPost(null)}
        onConfirm={handleDeletePost}
      />
    </div>
  );
};

export default function Newsletter() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  
  const canManageNewsletter = isSignedIn && (
    user?.publicMetadata?.role === 'admin' || 
    user?.publicMetadata?.role === 'lead'
  );
  
  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/v1/newsletter/getPosts');
        if (response.ok) {
          const data = await response.json();
          setPosts(data.posts || []);
        } else {
          console.error('Failed to fetch posts');
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPosts();
  }, []);
  
  const handleViewPost = (post: Post) => {
    setSelectedPost(post);
    window.scrollTo(0, 0);
  };
  
  const handleClosePost = () => {
    setSelectedPost(null);
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-white text-black">
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto flex h-14 items-center">
          <div className="flex-1">
            <a className="flex items-center space-x-2" href="/">
              <Award className="h-6 w-6 text-green-600" />
              <span className="hidden font-bold sm:inline-block text-green-600">
                BASIS Cedar Park NJHS
              </span>
            </a>
          </div>
          <nav className="flex-1 flex items-center justify-center gap-5 text-sm font-medium">
            <a
              className="transition-colors hover:text-black text-black"
              href="/#about"
            >
              About
            </a>
            <a
              className="transition-colors hover:text-black text-black"
              href="/#pillars"
            >
              Pillars
            </a>
            <a
              className="transition-colors hover:text-black text-black"
              href="/#activities"
            >
              Activities
            </a>
            <a
              className="transition-colors hover:text-black text-black"
              href="/#membership"
            >
              Membership
            </a>
            <a
              className="transition-colors hover:text-black text-black"
              href="/newsletter"
            >
              Newsletter
            </a>
            <a
              className="transition-colors hover:text-black text-black whitespace-nowrap"
              href="/dashboard"
            >
              Member Dashboard
            </a>
          </nav>
          <div className="flex-1 flex justify-end">
            <SignedOut>
              <a href="/sign-in">
                <Button className="bg-green-600 text-white hover:bg-green-700">
                  Sign In
                </Button>
              </a>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto py-8 px-4 md:px-6 lg:px-8 w-full max-w-7xl flex flex-col items-center">
        <h1 className="text-3xl font-bold text-center mb-8 w-full">NJHS Newsletter</h1>
        
        {canManageNewsletter && (
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-8 w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="all">All Posts</TabsTrigger>
              <TabsTrigger value="manage">Manage Posts</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-4 w-full">
              {selectedPost ? (
                <PostView post={selectedPost} onClose={handleClosePost} />
              ) : (
                <div className="w-full">
                  {isLoading ? (
                    <p className="text-center">Loading posts...</p>
                  ) : posts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {posts.map((post: Post) => (
                        <PostPreview key={post.id} post={post} onView={handleViewPost} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-center">No newsletter posts available yet.</p>
                  )}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="manage" className="mt-4 w-full">
              <NewsletterManagement currentUser={user as unknown as User} />
            </TabsContent>
          </Tabs>
        )}
        
        {!canManageNewsletter && (
          <div className="w-full">
            {isLoading ? (
              <p className="text-center">Loading posts...</p>
            ) : posts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post: Post) => (
                  <PostPreview key={post.id} post={post} onView={handleViewPost} />
                ))}
              </div>
            ) : (
              <p className="text-center">No newsletter posts available yet.</p>
            )}
          </div>
        )}
      </main>
      <footer id="contact" className="w-full py-6 bg-gray-100 mt-auto">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
              <Award className="h-6 w-6 text-green-600" />
              <p className="text-center text-sm leading-loose text-gray-600 md:text-left">
                © 2025 BASIS Cedar Park NJHS. All rights reserved.
              </p>
            </div>
            <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
              <p className="text-center text-sm leading-loose text-gray-600 md:text-left">
                Contact:{" "}
                <a
                  href="mailto:contact@basiscpk.com"
                  className="underline hover:text-green-600"
                >
                  contact@basiscpk.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
