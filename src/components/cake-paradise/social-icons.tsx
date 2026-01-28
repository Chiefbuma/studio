'use client';

import { FacebookIcon } from '@/components/icons/facebook-icon';
import { InstagramIcon } from '@/components/icons/instagram-icon';
import { TiktokIcon } from '@/components/icons/tiktok-icon';
import { WhatsappIcon } from '@/components/icons/whatsapp-icon';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useIsMobile } from '@/hooks/use-mobile';

const socialIcons = [
  {
    id: 'whatsapp',
    icon: <WhatsappIcon className="w-5 h-5 sm:w-6 sm:h-6" />,
    bgColor: 'bg-[#25D366] hover:bg-[#128C7E]',
    link: 'https://wa.me/254712345678?text=Hi!%20I%20want%20to%20order%20a%20cake%20from%20Cake%20Paradise',
    label: 'Chat on WhatsApp'
  },
  {
    id: 'instagram',
    icon: <InstagramIcon className="w-5 h-5 sm:w-6 sm:h-6" />,
    bgColor: 'bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] hover:opacity-90',
    link: 'https://instagram.com/cakeparadise',
    label: 'Follow on Instagram'
  },
  {
    id: 'facebook',
    icon: <FacebookIcon className="w-5 h-5 sm:w-6 sm:h-6" />,
    bgColor: 'bg-[#1877F2] hover:bg-[#166FE5]',
    link: 'https://facebook.com/cakeparadise',
    label: 'Like on Facebook'
  },
  {
    id: 'tiktok',
    icon: <TiktokIcon className="w-5 h-5 sm:w-6 sm:h-6" />,
    bgColor: 'bg-black hover:bg-gray-800',
    link: 'https://www.tiktok.com/@cakeparadise',
    label: 'Follow on TikTok'
  }
];

export function SocialIcons() {
  const isMobile = useIsMobile();
  
  return (
    <div className="fixed z-50 bottom-4 left-1/2 -translate-x-1/2 sm:left-auto sm:right-4 sm:top-1/2 sm:-translate-y-1/2 sm:transform-none">
      <TooltipProvider>
        <div className="flex items-center space-x-3 rounded-full bg-card/80 p-2 backdrop-blur-sm sm:flex-col sm:space-y-4 sm:space-x-0 sm:rounded-none sm:bg-transparent sm:p-0 sm:backdrop-blur-none shadow-lg sm:shadow-none">
          {socialIcons.map((social) => (
            <Tooltip key={social.id}>
              <TooltipTrigger asChild>
                <a
                  href={social.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`relative group ${social.bgColor} w-10 h-10 sm:w-12 sm:h-12 rounded-full shadow-lg flex items-center justify-center text-white transition-all duration-300 hover:scale-110 hover:shadow-xl`}
                >
                  {social.icon}
                </a>
              </TooltipTrigger>
              <TooltipContent side={isMobile ? 'top' : 'left'}>
                <p>{social.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>
    </div>
  );
}
