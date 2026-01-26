
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { CustomizationCategory, CustomizationData } from '@/lib/types';
import { createCustomizationOption, updateCustomizationOption } from '@/services/cake-service';
import { Loader2 } from 'lucide-react';
import { Textarea } from '../ui/textarea';

const baseSchema = {
    id: z.string().min(2, "ID must be at least 2 characters."),
    name: z.string().min(3, "Name is required."),
    price: z.coerce.number().min(0, "Price must be a positive number."),
};

const formSchemas = {
    flavors: z.object({
        ...baseSchema,
        description: z.string().optional(),
        color: z.string().optional(),
    }),
    sizes: z.object({
        ...baseSchema,
        serves: z.string().optional(),
    }),
    colors: z.object({
        ...baseSchema,
        hex_value: z.string().regex(/^#([0-9a-f]{3}){1,2}$/i, "Must be a valid hex color code."),
    }),
    toppings: z.object({
        ...baseSchema,
    }),
};

interface CustomizationDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onFormSubmit: () => void;
    category: CustomizationCategory;
    itemToEdit: CustomizationData | null;
}

const categoryTitles: Record<CustomizationCategory, string> = {
    flavors: "Flavor",
    sizes: "Size",
    colors: "Color",
    toppings: "Topping",
};

export function CustomizationDialog({ isOpen, onOpenChange, onFormSubmit, category, itemToEdit }: CustomizationDialogProps) {
    const { toast } = useToast();
    const isEditMode = !!itemToEdit;
    const title = categoryTitles[category];
    const currentSchema = formSchemas[category];

    const form = useForm({
        resolver: zodResolver(currentSchema),
    });

    useEffect(() => {
        if (isOpen) {
            if (isEditMode && itemToEdit) {
                form.reset(itemToEdit);
            } else {
                form.reset({
                    id: '',
                    name: '',
                    price: 0,
                    ...(category === 'flavors' && { description: '', color: '#FFFFFF' }),
                    ...(category === 'sizes' && { serves: '' }),
                    ...(category === 'colors' && { hex_value: '#FFFFFF' }),
                });
            }
        }
    }, [isOpen, isEditMode, itemToEdit, form, category]);

     const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        form.setValue('name', e.target.value);
        if (!isEditMode) {
            const slug = e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            form.setValue('id', slug);
        }
    }

    const onSubmit = async (data: any) => {
        try {
            if (isEditMode && itemToEdit) {
                await updateCustomizationOption(category, itemToEdit.id!, data);
                toast({ title: "Success", description: `${title} updated successfully.` });
            } else {
                await createCustomizationOption(category, data);
                toast({ title: "Success", description: `${title} created successfully.` });
            }
            onFormSubmit();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            toast({ variant: "destructive", title: "Error", description: errorMessage });
        }
    };
    
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEditMode ? `Edit ${title}` : `Create a New ${title}`}</DialogTitle>
                    <DialogDescription>
                        {isEditMode ? `Editing "${itemToEdit?.name}"` : `Fill in the details for the new ${title.toLowerCase()}.`}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                         <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder={`e.g., Rich Chocolate`} {...field} onChange={handleNameChange} />
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
                                    <FormLabel>ID (slug)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="auto-generated-from-name" {...field} disabled={isEditMode} />
                                    </FormControl>
                                     <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="price"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Additional Price (KES)</FormLabel>
                                    <FormControl>
                                        <Input type="number" step="0.01" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {category === 'flavors' && (
                            <>
                                <FormField control={form.control} name="description" render={({ field }) => (
                                    <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Deep, decadent, and dark" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                 <FormField control={form.control} name="color" render={({ field }) => (
                                    <FormItem><FormLabel>Color Preview</FormLabel><FormControl><Input type="color" {...field} className="h-10 p-1" /></FormControl><FormMessage /></FormItem>
                                )} />
                            </>
                        )}
                        {category === 'sizes' && (
                            <FormField control={form.control} name="serves" render={({ field }) => (
                                <FormItem><FormLabel>Serves</FormLabel><FormControl><Input placeholder="e.g., 6-8 people" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                        )}
                        {category === 'colors' && (
                             <FormField control={form.control} name="hex_value" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Hex Color</FormLabel>
                                    <div className="flex items-center gap-2">
                                        <FormControl>
                                            <Input type="color" {...field} className="h-10 w-12 p-1"/>
                                        </FormControl>
                                        <FormControl>
                                            <Input placeholder="#FFFFFF" {...field} />
                                        </FormControl>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        )}

                        <DialogFooter className='pt-4'>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                             <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                {isEditMode ? 'Save Changes' : `Create ${title}`}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
