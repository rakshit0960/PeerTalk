import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function WhatsAppChat() {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar - Contacts List */}
      <div className="w-[30%] border-r">
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <Avatar>
            <AvatarImage src="/path-to-your-avatar.jpg" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" aria-label="Settings">
              <span className="text-gray-600">⚙️</span> {/* Settings icon */}
            </Button>
            <Button variant="ghost" size="sm" aria-label="Logout">
              <span className="text-gray-600">🔓</span> {/* Logout icon */}
            </Button>
          </div>
        </div>

        {/* Contacts List */}
        <ScrollArea className="h-full">
          <div className="space-y-2 p-4">
            {/* Contact Item */}
            <div className="flex items-center space-x-3 p-3 cursor-pointer">
              <Avatar>
                <AvatarImage src="/path-to-contact-avatar.jpg" />
                <AvatarFallback>J</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium">John Doe</p>
                <p className="text-sm text-muted-foreground">Last message preview</p>
              </div>
            </div>

            {/* Additional Contacts */}
            {/* Repeat contact items as necessary */}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <CardHeader className="p-4 border-b flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src="/path-to-contact-avatar.jpg" />
              <AvatarFallback>J</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">John Doe</p>
              <p className="text-sm text-muted-foreground">Online</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" aria-label="Search">
              <span className="text-gray-600">🔍</span> {/* Search icon */}
            </Button>
            <Button variant="ghost" size="sm" aria-label="More">
              <span className="text-gray-600">⋮</span> {/* More options icon */}
            </Button>
          </div>
        </CardHeader>

        {/* Chat Messages Area */}
        <ScrollArea className="flex-grow p-4">
          <div className="space-y-4">
            {/* Sender Message */}
            <div className="flex items-start space-x-2">
              <Avatar>
                <AvatarImage src="/path-to-avatar.jpg" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div>
                <div className="p-3 rounded-lg max-w-xs">
                  <p>Hello! How are you?</p>
                </div>
                <span className="text-xs text-muted-foreground">12:00 PM</span>
              </div>
            </div>

            {/* Receiver Message */}
            <div className="flex items-start space-x-2 justify-end">
              <div>
                <div className="p-3 rounded-lg max-w-xs">
                  <p>I’m doing well, thank you! How about you?</p>
                </div>
                <span className="text-xs text-muted-foreground text-right block">12:05 PM</span>
              </div>
              <Avatar>
                <AvatarImage src="/path-to-contact-avatar.jpg" />
                <AvatarFallback>J</AvatarFallback>
              </Avatar>
            </div>

            {/* More messages */}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <CardFooter className="p-4 border-t">
          <div className="flex items-center w-full space-x-2">
            <Button variant="ghost" size="sm" aria-label="Emoji">
              <span className="text-gray-600">😊</span> {/* Emoji icon */}
            </Button>
            <Input
              type="text"
              placeholder="Type a message"
              className="flex-grow"
            />
            <Button variant="ghost" size="sm" aria-label="Attach">
              <span className="text-gray-600">📎</span> {/* Attach icon */}
            </Button>
            <Button size="sm" aria-label="Send">
              <span className="text-gray-600">▶️</span> {/* Send icon */}
            </Button>
          </div>
        </CardFooter>
      </div>
    </div>
  );
}
