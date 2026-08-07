"use client";

import { useMemo, useState } from "react";
import { BrainCircuit, Code2, Loader2, Sparkles } from "lucide-react";

import { ChatParserInput } from "@/components/ai-chat-parser/chat-parser-input";
import { ChatParserInsightsPanel } from "@/components/ai-chat-parser/chat-parser-insights-panel";
import { ChatParserPreviewTable } from "@/components/ai-chat-parser/chat-parser-preview-table";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { computeChatParserInsights } from "@/lib/ai-chat-parser/insights";
import { parseShoppingChat } from "@/lib/ai-chat-parser/parse-chat";
import {
  toParsedChatOrderJson,
  type ChatParserSummary,
  type ParsedChatOrder,
} from "@/lib/ai-chat-parser/types";
import { enrichOrderWorkflow } from "@/lib/ai-chat-parser/workflow";
import { useTranslation } from "@/lib/i18n/context";

export function AiChatParserManager() {
  const { t } = useTranslation();
  const [chatText, setChatText] = useState("");
  const [orders, setOrders] = useState<ParsedChatOrder[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showJson, setShowJson] = useState(false);

  const summary = useMemo<ChatParserSummary>(
    () => computeChatParserInsights(orders),
    [orders]
  );

  const jsonPreview = useMemo(
    () =>
      JSON.stringify(
        {
          orders: orders.map((order) => toParsedChatOrderJson(order)),
          summary,
        },
        null,
        2
      ),
    [orders, summary]
  );

  const handleParse = async () => {
    const text = chatText.trim();
    if (!text || isParsing) {
      return;
    }

    setIsParsing(true);
    setError(null);

    try {
      const parsed = await parseShoppingChat(text);
      setOrders(parsed.orders);
      setShowJson(true);
    } catch (parseError) {
      setError(
        parseError instanceof Error
          ? parseError.message
          : t("aiChatParser.parseFailed")
      );
    } finally {
      setIsParsing(false);
    }
  };

  const handleUpdateOrder = (order: ParsedChatOrder) => {
    setOrders((current) =>
      current.map((item) =>
        item.id === order.id ? enrichOrderWorkflow(order) : item
      )
    );
  };

  const handleClear = () => {
    setChatText("");
    setOrders([]);
    setError(null);
    setShowJson(false);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 animate-fade-in pb-8">
      <PageHeader
        title={t("aiChatParser.title")}
        description={t("aiChatParser.description")}
      >
        <Badge variant="secondary" className="h-8 px-3 text-xs font-medium">
          <Sparkles className="mr-1.5 h-3.5 w-3.5" />
          {t("aiChatParser.versionBadge")}
        </Badge>
      </PageHeader>

      <ChatParserInput
        value={chatText}
        onChange={setChatText}
        disabled={isParsing}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button
          type="button"
          size="lg"
          onClick={() => void handleParse()}
          disabled={!chatText.trim() || isParsing}
          className="h-11 w-full touch-manipulation shadow-sm sm:w-auto"
        >
          {isParsing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("aiChatParser.parsing")}
            </>
          ) : (
            <>
              <BrainCircuit className="h-4 w-4" />
              {t("aiChatParser.parseAction")}
            </>
          )}
        </Button>

        {(orders.length > 0 || chatText.trim()) && (
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={handleClear}
            disabled={isParsing}
            className="h-11 w-full touch-manipulation sm:w-auto"
          >
            {t("aiChatParser.clearAction")}
          </Button>
        )}
      </div>

      {error && (
        <Card className="border-destructive/30 bg-destructive/5 shadow-sm">
          <CardContent className="py-4 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      {orders.length > 0 && (
        <div className="space-y-6">
          <ChatParserInsightsPanel summary={summary} />

          <Card className="border-border/60 shadow-sm">
            <CardHeader className="gap-4 space-y-0 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-lg">
                  {t("aiChatParser.previewTitle")}
                </CardTitle>
                <CardDescription>
                  {t("aiChatParser.previewDescription")}
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowJson((current) => !current)}
                className="h-9 w-full touch-manipulation sm:w-auto"
              >
                <Code2 className="h-4 w-4" />
                {showJson
                  ? t("aiChatParser.hideJson")
                  : t("aiChatParser.showJson")}
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <ChatParserPreviewTable orders={orders} onUpdate={handleUpdateOrder} />

              {showJson && (
                <div className="overflow-hidden rounded-xl border border-border/60 bg-muted/20">
                  <div className="border-b border-border/60 px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    JSON
                  </div>
                  <pre className="max-h-[420px] overflow-auto p-4 text-xs leading-relaxed text-foreground">
                    {jsonPreview}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-dashed border-border/60 bg-muted/10 shadow-sm">
            <CardContent className="flex flex-col gap-2 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium">{t("aiChatParser.importSoonTitle")}</p>
                <p className="text-sm text-muted-foreground">
                  {t("aiChatParser.importSoonDescription")}
                </p>
              </div>
              <Button type="button" disabled className="h-10 w-full sm:w-auto">
                {t("aiChatParser.importAction")}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
