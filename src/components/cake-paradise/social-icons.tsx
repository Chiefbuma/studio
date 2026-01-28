'use client';

import { InstagramIcon } from '@/components/icons/instagram-icon';
import { TiktokIcon } from '@/components/icons/tiktok-icon';
import { WhatsappIcon } from '@/components/icons/whatsapp-icon';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const ownerWhatsAppNumber = process.env.NEXT_PUBLIC_OWNER_WHATSAPP_NUMBER || '';

const socialIcons = [
  {
    id: 'whatsapp',
    icon: <WhatsappIcon className="w-6 h-6" />,
    bgColor: 'bg-[#25D366] hover:bg-[#128C7E]',
    link: `https://wa.me/${ownerWhatsAppNumber}?text=Hi!%20I%20want%20to%20order%20a%20cake%20from%20WhiskeDelights`,
    label: 'Chat on WhatsApp'
  },
  {
    id: 'instagram',
    icon: <InstagramIcon className="w-6 h-6" />,
    bgColor: 'bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] hover:opacity-90',
    link: 'https://instagram.com/whiskedelights',
    label: 'Follow on Instagram'
  },
  {
    id: 'tiktok',
    icon: <TiktokIcon className="w-6 h-6" />,
    bgColor: 'bg-black hover:bg-gray-800',
    link: 'https://www.tiktok.com/@whiskedelights',
    label: 'Follow on TikTok'
  }
];

export function SocialIcons() {
  return (
    <div className="fixed z-50 left-4 top-1/2 -translate-y-1/2">
      <TooltipProvider>
        <div className="flex flex-col items-center space-y-4">
          {socialIcons.map((social) => (
            <Tooltip key={social.id}>
              <TooltipTrigger asChild>
                <a
                  href={social.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`relative group ${social.bgColor} w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-white transition-all duration-300 hover:scale-110 hover:shadow-xl`}
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
