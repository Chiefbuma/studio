import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Cake, CustomizationOptions, Customizations } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { IceCream2, Palette, Ruler, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CustomizationFormProps {
    cake: Cake;
    customizationOptions: CustomizationOptions;
    customizations: Customizations;
    handleCustomizationChange: (type: 'flavor' | 'size' | 'color' | 'toppings', value: string) => void;
}

export function CustomizationForm({ cake, customizationOptions, customizations, handleCustomizationChange }: CustomizationFormProps) {
    const renderOption = (
        type: 'flavor' | 'size' | 'color',
        option: any,
        isSelected: boolean
    ) => (
        <Button
            key={option.id}
            variant={isSelected ? "secondary" : "outline"}
            onClick={() => handleCustomizationChange(type, option.id)}
            className={`w-full h-auto justify-between p-3 transition-all text-left flex ${isSelected ? 'border-primary ring-2 ring-primary' : 'border-dashed'}`}
        >
            <div className="flex items-center gap-3">
                {type === 'color' && (
                    <div className="w-8 h-8 rounded-md border" style={{ backgroundColor: option.hex_value }}></div>
                )}
                 {type === 'flavor' && (
                    <div className="w-8 h-8 rounded-md border" style={{ backgroundColor: option.color }}></div>
                )}
                <div>
                    <div className="font-semibold text-foreground">{option.name}</div>
                    {option.description && (
                        <div className="text-xs text-muted-foreground hidden sm:block">{option.description}</div>
                    )}
                    {option.serves && (
                        <div className="text-xs text-muted-foreground mt-1">Serves: {option.serves}</div>
                    )}
                </div>
            </div>
            <div className="text-right">
                <div className="font-bold text-primary">
                    +{formatPrice(option.price)}
                </div>
            </div>
        </Button>
    );

    const renderTopping = (topping: any, isSelected: boolean) => (
        <Button
            key={topping.id}
            variant={isSelected ? "secondary" : "outline"}
            onClick={() => handleCustomizationChange('toppings', topping.id)}
            className={`w-full h-auto justify-between p-3 transition-all text-left flex ${isSelected ? 'border-primary ring-2 ring-primary' : 'border-dashed'}`}
        >
            <div className="font-semibold text-foreground">{topping.name}</div>
            <div className="font-bold text-primary">+{formatPrice(topping.price)}</div>
        </Button>
    );

    return (
        <Tabs defaultValue="flavor" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="flavor"><IceCream2 className="w-4 h-4 mr-1 sm:mr-2" /> <span className="hidden sm:inline">Flavor</span></TabsTrigger>
                <TabsTrigger value="size"><Ruler className="w-4 h-4 mr-1 sm:mr-2" /> <span className="hidden sm:inline">Size</span></TabsTrigger>
                <TabsTrigger value="color"><Palette className="w-4 h-4 mr-1 sm:mr-2" /> <span className="hidden sm:inline">Color</span></TabsTrigger>
                <TabsTrigger value="toppings"><Star className="w-4 h-4 mr-1 sm:mr-2" /> <span className="hidden sm:inline">Toppings</span> <Badge className="ml-2 hidden sm:block">{customizations.toppings.length}</Badge></TabsTrigger>
            </TabsList>
            <div className="mt-4 max-h-[350px] overflow-y-auto p-1 pr-3">
                <TabsContent value="flavor">
                    <div className="space-y-3">
                        {customizationOptions.flavors?.map(flavor => renderOption('flavor', flavor, customizations.flavor === flavor.id))}
                    </div>
                </TabsContent>
                <TabsContent value="size">
                    <div className="space-y-3">
                        {customizationOptions.sizes?.map(size => renderOption('size', size, customizations.size === size.id))}
                    </div>
                </TabsContent>
                <TabsContent value="color">
                    <div className="space-y-3">
                        {customizationOptions.colors?.map(color => renderOption('color', color, customizations.color === color.id))}
                    </div>
                </TabsContent>
                <TabsContent value="toppings">
                    <div className="space-y-3">
                        {customizationOptions.toppings?.map(topping => renderTopping(topping, customizations.toppings.includes(topping.id)))}
                    </div>
                </TabsContent>
            </div>
        </Tabs>
    );
}
