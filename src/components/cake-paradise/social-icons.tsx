
'use client';

import { InstagramIcon } from '@/components/icons/instagram-icon';
import { TiktokIcon } from '@/components/icons/tiktok-icon';
import { WhatsappIcon } from '@/components/icons/whatsapp-icon';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const ownerWhatsAppNumber = process.env.NEXT_PUBLIC_OWNER_WHATSAPP_NUMBER || '';

const socialIcons = [
  {
    id: 'whatsapp',
    icon: <WhatsappIcon className="w-5 h-5" />,
    bgColor: 'bg-[#25D366] hover:bg-[#128C7E]',
    link: `https://wa.me/${ownerWhatsAppNumber}?text=Hi!%20I%20want%20to%20order%20a%20cake%20from%20WhiskeDelights`,
    label: 'Order or Enquire'
  },
  {
    id: 'instagram',
    icon: <InstagramIcon className="w-5 h-5" />,
    bgColor: 'bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] hover:opacity-90',
    link: 'https://instagram.com/whiskedelights',
    label: 'Customer Stories & Creations'
  },
  {
    id: 'tiktok',
    icon: <TiktokIcon className="w-5 h-5" />,
    bgColor: 'bg-black hover:bg-gray-800',
    link: 'https://www.tiktok.com/@whiskedelights',
    label: 'Behind the Scenes'
  }
];

export function SocialIcons() {
  return (
    // NOTE: This component is hidden on mobile screens (below md breakpoint) to avoid obstructing content.
    <div className="fixed z-50 left-4 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-2">
        <div style={{ writingMode: 'vertical-rl' }} className="transform rotate-180 text-xs tracking-wider text-muted-foreground">
            Happy Customers
        </div>

        <TooltipProvider>
            <div className="flex flex-col items-center space-y-3">
            {socialIcons.map((social) => (
                <Tooltip key={social.id}>
                <TooltipTrigger asChild>
                    <a
                    href={social.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`relative group ${social.bgColor} w-10 h-10 rounded-full shadow-lg flex items-center justify-center text-white transition-all duration-300 hover:scale-110 hover:shadow-xl`}
                    >
                    {social.icon}
                    </a>
                </TooltipTrigger>
                <TooltipContent side="right">
                    <p>{social.label}</p>
                </TooltipContent>
                </Tooltip>
            ))}
            </div>
        </TooltipProvider>
    </div>
  );
}
