import { AIMatchingEngine } from "@/components/matching/ai-matching-engine"
import { ChatInterface } from "@/components/communication/chat-interface"
import { NotificationCenter } from "@/components/communication/notification-center"
import { MeetingScheduler } from "@/components/communication/meeting-scheduler"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StartupNavigation } from "@/components/startup/startup-navigation"

export default function MatchingPage() {
  // In a real app, this would come from user authentication
  const userType: "investor" | "startup" = Math.random() > 0.5 ? "investor" : "startup";

  return (
    <div className="min-h-screen bg-gray-50">
      <StartupNavigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {userType === "investor" ? "Deal Flow & Communication" : "Investor Matching & Communication"}
          </h1>
          <p className="text-gray-600">
            {userType === "investor"
              ? "Manage your startup pipeline and communications"
              : "Connect with investors and manage your fundraising communications"}
          </p>
        </div>

        <Tabs defaultValue="matching" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="matching">AI Matching</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="meetings">Meetings</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="matching" className="space-y-6">
            <AIMatchingEngine userType={userType} />
          </TabsContent>

          <TabsContent value="messages" className="space-y-6">
            <ChatInterface userType={userType} />
          </TabsContent>

          <TabsContent value="meetings" className="space-y-6">
            <MeetingScheduler userType={userType} />
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <NotificationCenter userType={userType} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
