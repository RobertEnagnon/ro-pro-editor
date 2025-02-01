import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, Globe, Youtube, Facebook, Instagram } from "lucide-react"

const socialLinks = [
  {
    icon: Mail,
    label: "contact@ronasdev.com",
    href: "mailto:contact@ronasdev.com",
    color: "text-blue-500 dark:text-blue-400",
  },
  {
    icon: Globe,
    label: "ronasdev.com",
    href: "https://ronasdev.com",
    color: "text-emerald-500 dark:text-emerald-400",
  },
  {
    icon: Youtube,
    label: "YouTube: ronasdev",
    href: "https://www.youtube.com/@ronasdev",
    color: "text-red-500 dark:text-red-400",
  },
  {
    icon: Facebook,
    label: "Facebook: ronasdev",
    href: "https://facebook.com/ronasdev",
    color: "text-blue-600 dark:text-blue-500",
  },
  {
    icon: Instagram,
    label: "Instagram: ronasdev",
    href: "https://instagram.com/ronasdev",
    color: "text-pink-500 dark:text-pink-400",
  },
]

export default function ContactSection() {
  return (
    <div className="py-12">
      <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-0 shadow-2xl">
        <CardContent className="p-8 md:p-12">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 text-transparent bg-clip-text">
                Connectez avec <span className="bg-gradient-to-r from-blue-400 to-blue-600 text-transparent bg-clip-text">ronasdev</span>
              </h2>
              <p className="text-gray-400 text-lg">
                Développeur fullstack & Créateur de contenu tech
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {socialLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group"
                >
                  <Button
                    variant="ghost"
                    className="w-full bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 transition-all duration-300 hover:scale-105"
                  >
                    <div className="flex items-center justify-start space-x-3 w-full">
                      <link.icon className={`w-5 h-5 ${link.color} transition-transform group-hover:scale-110`} />
                      <span className="text-gray-200 group-hover:text-white transition-colors">
                        {link.label}
                      </span>
                    </div>
                  </Button>
                </a>
              ))}
            </div>

            <div className="pt-6">
              <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 inline-block">
                <p className="text-gray-400">
                  Suivez-moi pour des projets innovants et des tutoriels exclusifs !{" "}
                  <span className="animate-pulse inline-block">🚀</span>
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}