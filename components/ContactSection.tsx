import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Globe, Youtube, Facebook, Instagram,
    //  TikTok
     } from "lucide-react";

export default function ContactSection() {
  return (
    <div >

      {/* Section de contact moderne et responsive */}
      <Card className="bg-blue-900 mt-8 text-white rounded-2xl shadow-lg">
        <CardContent className="p-8 text-center space-y-6">
          <h2 className="text-3xl font-extrabold mb-4">Contactez <span className="text-yellow-400">ronasdev</span></h2>
          <p className="text-lg">Développeur fullstack & Créateur de contenu tech.</p>

          <div className="flex flex-col md:flex-row justify-start items-center gap-6 flex-wrap">
            {/* Email */}
            <Button variant="ghost" className="flex items-center space-x-3 hover:bg-blue-800 p-4 rounded-lg transition-colors">
              <Mail className="w-6 h-6 text-yellow-400" />
              <a href="mailto:contact@ronasdev.com" className="text-lg">contact@ronasdev.com</a>
            </Button>

            {/* Site Web */}
            <Button variant="ghost" className="flex items-center space-x-3 hover:bg-blue-800 p-4 rounded-lg transition-colors">
              <Globe className="w-6 h-6 text-yellow-400" />
              <a href="https://ronasdev.com" target="_blank" rel="noopener noreferrer" className="text-lg">ronasdev.com</a>
            </Button>

            {/* YouTube */}
            <Button variant="ghost" className="flex items-center space-x-3 hover:bg-blue-800 p-4 rounded-lg transition-colors">
              <Youtube className="w-6 h-6 text-yellow-400" />
              <a href="https://www.youtube.com/@ronasdev" target="_blank" rel="noopener noreferrer" className="text-lg">YouTube: ronasdev</a>
            </Button>

            {/* Facebook */}
            <Button variant="ghost" className="flex items-center space-x-3 hover:bg-blue-800 p-4 rounded-lg transition-colors">
              <Facebook className="w-6 h-6 text-yellow-400" />
              <a href="https://facebook.com/ronasdev" target="_blank" rel="noopener noreferrer" className="text-lg">Facebook: ronasdev</a>
            </Button>

            {/* Instagram */}
            <Button variant="ghost" className="flex items-center space-x-3 hover:bg-blue-800 p-4 rounded-lg transition-colors">
              <Instagram className="w-6 h-6 text-yellow-400" />
              <a href="https://instagram.com/ronasdev" target="_blank" rel="noopener noreferrer" className="text-lg">Instagram: ronasdev</a>
            </Button>

            {/* TikTok */}
            {/* <Button variant="ghost" className="flex items-center space-x-3 hover:bg-blue-800 p-4 rounded-lg transition-colors">
              <TikTok className="w-6 h-6 text-yellow-400" />
              <a href="https://tiktok.com/@ronasdev1" target="_blank" rel="noopener noreferrer" className="text-lg">TikTok: @ronasdev1</a>
            </Button> */}
          </div>

          <p className="text-sm mt-4">Suivez-moi pour des projets innovants et des tutoriels exclusifs ! 🚀</p>
        </CardContent>
      </Card>
    </div>
  );
}
