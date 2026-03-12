import { useState, useRef, useEffect } from "react";
import { Send, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollRevealSection } from "./ScrollReveal";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
}

const defaultMessages: Message[] = [
  {
    id: 1,
    role: "assistant",
    content:
      "Hello! I'm your AI Investment Advisor. Ask me anything about investments, portfolio strategies, market trends, or financial planning. How can I help you today?",
  },
];

const SYSTEM_PROMPT = `You are FinAdvisor AI, a helpful and responsible financial advisor for users in Malaysia. Your job is to recommend safe and legitimate investment platforms in Malaysia based on the user's financial situation. Only recommend platforms from the approved list of 10 safe platforms provided below. Choose the most suitable platform for the user's situation covering income, monthly amount, beginner level, and risk tolerance. Do NOT list all 10 platforms in the answer and only recommend 1 to 2 most suitable platforms. When recommending a platform always include a short explanation why it fits the user, pros, cons, and an optional tip. If the user has a small monthly amount RM50 to RM300 prioritize low minimum deposit platforms such as robo-advisors or micro-investing apps. If the user mentions Shariah compliance prioritize ASB or Wahed. If the user wants stock trading prioritize Moomoo or Rakuten Trade. If the user wants crypto recommend Luno. Never promise guaranteed profits and always mention that investments carry risk. Keep answers clear, simple, and beginner-friendly. Always format your response exactly as: Recommended Platform on its own line showing the platform name, then Why This Fits You as a heading followed by a short explanation based on the user's situation, then Pros as a heading followed by bullet points, then Cons as a heading followed by bullet points, then Optional Tip as a heading followed by a short investing tip for beginners. The approved safe investment platforms are: first ASB also known as Amanah Saham Bumiputera which is a Unit Trust Fund with pros of very low risk compared to most investments, managed by Permodalan Nasional Berhad PNB, and historically stable returns, and cons of only available for Bumiputera and limited liquidity compared to trading platforms; second Versa which is a cash management and money market investment with pros of very low minimum investment, easy mobile app, and suitable for beginners, and cons of lower returns compared to stocks and not suitable for aggressive investors; third StashAway which is a robo-advisor using ETF investing with pros of automated portfolio management, diversified global ETFs, and good for passive investors, and cons of management fee applies and market performance can fluctuate; fourth Wahed which is a Shariah-compliant robo advisor with pros of 100% Shariah compliant, diversified portfolio, and beginner friendly, and cons of management fee and returns depend on market performance; fifth Moomoo which is a stock trading platform with pros of access to US, HK, and Malaysia stocks, advanced trading tools, and low trading fees, and cons of requires stock knowledge and higher risk compared to robo advisors; sixth Rakuten Trade which is a stock brokerage with pros of regulated by Securities Commission Malaysia, access to Bursa Malaysia stocks, and trusted partnership with Kenanga, and cons of mainly focused on Malaysian stocks and requires active trading knowledge; seventh Kenanga Digital Investing KDI which is a robo advisor with pros of managed by Kenanga Investment Bank, automated investing, and beginner friendly, and cons of returns fluctuate with market and fees apply; eighth FSMOne which is a multi investment platform with pros of access to unit trusts, ETFs, and bonds, wide variety of funds, and good for diversified portfolios, and cons of interface slightly complex for beginners and some funds require higher minimum investment; ninth Raiz which is a micro-investing app with pros of invest small spare change automatically, very beginner friendly, and simple app experience, and cons of limited investment control and management fee applies; tenth Luno which is a cryptocurrency exchange with pros of one of the first SC-approved crypto exchanges in Malaysia, easy for beginners, and supports major cryptocurrencies, and cons of crypto is highly volatile and higher risk compared to traditional investments.`;

const InvestmentAdvisorSection = () => {
  const [messages, setMessages] = useState<Message[]>(defaultMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now(),
      role: "user",
      content: input.trim(),
    };
    
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      console.log("API Key available:", !!import.meta.env.VITE_GEMINI_API_KEY);
      console.log("API Key length:", import.meta.env.VITE_GEMINI_API_KEY?.length);
      
      const apiMessages = [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages.map(m => ({ role: m.role, content: m.content })),
        { role: "user", content: userMsg.content }
      ];

      const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + import.meta.env.VITE_GEMINI_API_KEY, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: apiMessages.map(msg => ({
            role: msg.role === "assistant" ? "model" : "user",
            parts: [{ text: msg.content }]
          })),
          generationConfig: {
            maxOutputTokens: 3000,
          }
        })
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Failed to fetch response: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      const reply = data.candidates[0].content.parts[0].text;

      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "assistant", content: reply },
      ]);
    } catch (error) {
      console.error("Full error:", error);
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "assistant", content: "Sorry, I could not connect to the advisor. Please try again." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <section id="investment-advisor" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <ScrollRevealSection>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              AI Investment Advisor
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Get instant, AI-powered investment insights and portfolio advice
              tailored to your goals.
            </p>
          </div>
        </ScrollRevealSection>

        <ScrollRevealSection>
          <div className="max-w-3xl mx-auto rounded-2xl border border-border overflow-hidden shadow-xl bg-card">
            {/* Chat header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-[hsl(var(--asean-green))]">
              <Bot className="w-6 h-6 text-primary-foreground" />
              <span className="font-semibold text-primary-foreground text-lg">
                Investment Advisor
              </span>
              <span className="ml-auto text-xs bg-primary-foreground/20 text-primary-foreground rounded-full px-3 py-1">
                Online
              </span>
            </div>

            {/* Chat messages */}
            <div
              ref={scrollRef}
              className="h-[400px] md:h-[480px] overflow-y-auto p-4 md:p-6 space-y-4 bg-background"
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[hsl(var(--asean-green))] flex items-center justify-center">
                      <Bot className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-[hsl(var(--asean-green))] text-primary-foreground rounded-br-md"
                        : msg.content === "Sorry, I could not connect to the advisor. Please try again"
                        ? "bg-red-50 text-red-600 border border-red-200 rounded-bl-md"
                        : "bg-muted text-foreground rounded-bl-md"
                    }`}
                  >
                    {msg.content}
                  </div>
                  {msg.role === "user" && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <User className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-3 justify-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[hsl(var(--asean-green))] flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input area */}
            <div className="border-t border-border bg-card px-4 py-3 md:px-6 md:py-4">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about investments, stocks, portfolio strategies..."
                  className="flex-1 bg-background border border-border rounded-full px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--asean-green))] focus:border-transparent"
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="rounded-full w-10 h-10 p-0 bg-[hsl(var(--asean-green))] hover:bg-[hsl(var(--asean-green))]/90 text-primary-foreground"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </ScrollRevealSection>
      </div>
    </section>
  );
};

export default InvestmentAdvisorSection;
