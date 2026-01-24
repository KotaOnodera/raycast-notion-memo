import { Action, ActionPanel, Form, List, showToast, Toast, popToRoot } from "@raycast/api";
import { useEffect, useState } from "react";
import { findTodayPages, appendMemo, NotionPage } from "./utils/notion";

/**
 * Memo input form component.
 * Displays a text area for entering memo content and submits to Notion.
 * @param pageId - The Notion page ID to append the memo to
 * @param pageTitle - The title of the selected page (for display)
 */
function MemoForm({ pageId, pageTitle }: { pageId: string; pageTitle: string }) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(values: { memo: string }) {
    if (!values.memo.trim()) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: "Memo cannot be empty",
      });
      return;
    }

    setIsLoading(true);

    try {
      await appendMemo(pageId, values.memo.trim());
      await showToast({
        style: Toast.Style.Success,
        title: "Memo Added",
        message: `Added to "${pageTitle}"`,
      });
      await popToRoot();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      await showToast({
        style: Toast.Style.Failure,
        title: "Failed to Add Memo",
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form
      isLoading={isLoading}
      navigationTitle={`Add Memo to "${pageTitle}"`}
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Add Memo" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextArea
        id="memo"
        title="Memo"
        placeholder="Enter your memo..."
        enableMarkdown={false}
        autoFocus
      />
      <Form.Description title="Target Page" text={pageTitle} />
    </Form>
  );
}

/**
 * Page selection list component.
 * Displays all pages created today and allows selection.
 * @param pages - Array of today's pages to display
 * @param onSelect - Callback when a page is selected
 */
function PageList({
  pages,
  onSelect,
}: {
  pages: NotionPage[];
  onSelect: (page: NotionPage) => void;
}) {
  return (
    <List navigationTitle="Select Today's Page">
      {pages.map((page) => {
        const createdDate = new Date(page.createdTime);
        const timeString = createdDate.toLocaleTimeString("ja-JP", {
          hour: "2-digit",
          minute: "2-digit",
        });

        return (
          <List.Item
            key={page.id}
            title={page.title}
            subtitle={`Created at ${timeString}`}
            actions={
              <ActionPanel>
                <Action title="Select Page" onAction={() => onSelect(page)} />
              </ActionPanel>
            }
          />
        );
      })}
    </List>
  );
}

/**
 * Main command component.
 * Handles the flow: fetch today's pages -> select page (if multiple) -> show memo form.
 */
export default function Command() {
  const [isLoading, setIsLoading] = useState(true);
  const [pages, setPages] = useState<NotionPage[]>([]);
  const [selectedPage, setSelectedPage] = useState<NotionPage | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPages() {
      try {
        const todayPages = await findTodayPages();
        setPages(todayPages);

        if (todayPages.length === 0) {
          setError("No pages created today");
          await showToast({
            style: Toast.Style.Failure,
            title: "No Pages Found",
            message: "No pages were created today in the database",
          });
        } else if (todayPages.length === 1) {
          setSelectedPage(todayPages[0]);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch pages";
        setError(errorMessage);
        await showToast({
          style: Toast.Style.Failure,
          title: "Error",
          message: errorMessage,
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchPages();
  }, []);

  if (isLoading) {
    return <List isLoading={true} />;
  }

  if (error) {
    return (
      <List>
        <List.EmptyView title="Error" description={error} />
      </List>
    );
  }

  if (selectedPage) {
    return <MemoForm pageId={selectedPage.id} pageTitle={selectedPage.title} />;
  }

  if (pages.length > 1) {
    return <PageList pages={pages} onSelect={setSelectedPage} />;
  }

  return (
    <List>
      <List.EmptyView title="No Pages Found" description="No pages were created today" />
    </List>
  );
}
