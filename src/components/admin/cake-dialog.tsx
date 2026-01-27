
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { Cake, Flavor } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { createCake, updateCake } from '@/services/cake-service';
import { Loader2, Trash2 } from 'lucide-react';

const cakeFormSchema = z.object({
    id: z.string().min(3, "ID must be at least 3 characters long.").regex(/^[a-z0-9-]+$/, "ID can only contain lowercase letters, numbers, and hyphens."),
    name: z.string().min(3, "Name is required."),
    description: z.string().min(10, "Description is required."),
    base_price: z.coerce.number().min(0, "Price must be a positive number."),
    category: z.string().min(3, "Category is required."),
    ready_time: z.string().min(2, "Ready time is required."),
    image_data_uri: z.string().url("Invalid image data.").optional().nullable(),
    rating: z.coerce.number().min(0).max(5).optional(),
    orders_count: z.coerce.number().min(0).optional(),
    defaultFlavorId: z.string().optional().nullable(),
    customizable: z.boolean().default(false),
});

type CakeFormValues = z.infer<typeof cakeFormSchema>;

interface CakeDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onFormSubmit: () => void;
    cakeToEdit: Cake | null;
    flavors: Flavor[];
}

export function CakeDialog({ isOpen, onOpenChange, onFormSubmit, cakeToEdit, flavors }: CakeDialogProps) {
    const { toast } = useToast();
    const isEditMode = !!cakeToEdit;
    
    const form = useForm<CakeFormValues>({
        resolver: zodResolver(cakeFormSchema),
        defaultValues: {
            id: '',
            name: '',
            description: '',
            base_price: 0,
            category: '',
            ready_time: '',
            image_data_uri: null,
            rating: 4.5,
            orders_count: 0,
            defaultFlavorId: null,
            customizable: false,
        },
    });

    const imagePreview = form.watch('image_data_uri');

    useEffect(() => {
        if (isEditMode && cakeToEdit) {
            form.reset({
                ...cakeToEdit,
                defaultFlavorId: cakeToEdit.defaultFlavorId ?? null
            });
        } else {
            form.reset({
                id: '',
                name: '',
                description: '',
                base_price: 0,
                category: '',
                ready_time: '24h',
                image_data_uri: null,
                rating: 4.5,
                orders_count: 0,
                defaultFlavorId: null,
                customizable: false,
            });
        }
    }, [cakeToEdit, isEditMode, form, isOpen]);
    
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        form.setValue('name', e.target.value);
        if (!isEditMode) {
            const slug = e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            form.setValue('id', slug);
        }
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                toast({
                    variant: "destructive",
                    title: "Image too large",
                    description: "Please upload an image smaller than 2MB.",
                });
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                form.setValue('image_data_uri', reader.result as string, { shouldValidate: true });
            };
            reader.readAsDataURL(file);
        }
    };

    const onSubmit = async (data: CakeFormValues) => {
        try {
            if (isEditMode && cakeToEdit) {
                await updateCake(cakeToEdit.id, data);
                toast({ title: "Success", description: "Cake updated successfully." });
            } else {
                await createCake(data);
                toast({ title: "Success", description: "Cake created successfully." });
            }
            onFormSubmit();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            toast({ variant: "destructive", title: "Error", description: errorMessage });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? 'Edit Cake' : 'Create a New Cake'}</DialogTitle>
                    <DialogDescription>
                        {isEditMode ? `Editing "${cakeToEdit?.name}"` : 'Fill in the details for your new cake.'}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-4 no-scrollbar">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Cake Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Chocolate Fudge Delight" {...field} onChange={handleNameChange} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Cake ID (slug)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="auto-generated-from-name" {...field} disabled={isEditMode} />
                                    </FormControl>
                                     <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="image_data_uri"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Cake Image</FormLabel>
                                    {imagePreview ? (
                                        <div className="relative w-32 h-32">
                                            <Image src={imagePreview} alt="Cake preview" fill className="rounded-md object-cover" />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="absolute -top-2 -right-2 h-7 w-7 rounded-full"
                                                onClick={() => form.setValue('image_data_uri', null)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <FormControl>
                                            <Input type="file" accept="image/png, image/jpeg, image/webp" onChange={handleImageUpload} />
                                        </FormControl>
                                    )}
                                    <FormDescription>Upload a JPG, PNG or WEBP file. Max 2MB.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="A rich and decadent chocolate fudge cake..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="base_price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Base Price (KES)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Chocolate, Fruit, Classic" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="ready_time"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Ready Time</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., 24h, 48h" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                           <FormField
                                control={form.control}
                                name="defaultFlavorId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Default Flavor</FormLabel>
                                         <Select onValueChange={field.onChange} value={field.value ?? ''}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a default flavor" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="">None</SelectItem>
                                                {flavors.map(flavor => <SelectItem key={flavor.id} value={flavor.id}>{flavor.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            
                             <FormField
                                control={form.control}
                                name="customizable"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col rounded-lg border p-3 mt-2">
                                        <FormLabel>Is this cake customizable?</FormLabel>
                                        <div className='flex items-center space-x-2'>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <FormLabel>{field.value ? "Yes" : "No"}</FormLabel>
                                        </div>
                                    </FormItem>
                                )}
                            />
                        </div>
                       
                        <DialogFooter className='pt-4'>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                {isEditMode ? 'Save Changes' : 'Create Cake'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
