import { Client } from "@notionhq/client";
import { getPreferenceValues } from "@raycast/api";

interface Preferences {
  notionToken: string;
  databaseId: string;
}

export interface NotionPage {
  id: string;
  title: string;
  createdTime: string;
}

/**
 * Creates a Notion client instance using the stored API token.
 * @returns Configured Notion client
 */
function getNotionClient(): Client {
  const preferences = getPreferenceValues<Preferences>();
  return new Client({ auth: preferences.notionToken });
}

/**
 * Retrieves the database ID from preferences.
 * @returns The configured Notion database ID
 */
function getDatabaseId(): string {
  const preferences = getPreferenceValues<Preferences>();
  return preferences.databaseId;
}

/**
 * Extracts the title from a Notion page object.
 * Handles both 'title' and 'Name' property names.
 * @param page - The Notion page object from API response
 * @returns The page title or "Untitled" if not found
 */
function extractPageTitle(page: Record<string, unknown>): string {
  const properties = page.properties as Record<string, unknown>;

  for (const key of Object.keys(properties)) {
    const prop = properties[key] as Record<string, unknown>;
    if (prop.type === "title") {
      const titleArray = prop.title as Array<{ plain_text: string }>;
      if (titleArray && titleArray.length > 0) {
        return titleArray.map((t) => t.plain_text).join("");
      }
    }
  }

  return "Untitled";
}

/**
 * Finds all pages created today in the configured Notion database.
 * Uses the created_time filter to match today's date in local timezone.
 * @returns Array of pages created today with id, title, and createdTime
 */
export async function findTodayPages(): Promise<NotionPage[]> {
  const notion = getNotionClient();
  const databaseId = getDatabaseId();

  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      and: [
        {
          timestamp: "created_time",
          created_time: {
            on_or_after: startOfDay.toISOString(),
          },
        },
        {
          timestamp: "created_time",
          created_time: {
            before: endOfDay.toISOString(),
          },
        },
      ],
    },
    sorts: [
      {
        timestamp: "created_time",
        direction: "descending",
      },
    ],
  });

  return response.results.map((page) => {
    const pageData = page as unknown as Record<string, unknown>;
    return {
      id: pageData.id as string,
      title: extractPageTitle(pageData),
      createdTime: pageData.created_time as string,
    };
  });
}

/**
 * Appends a timestamped memo as a paragraph block to the end of a Notion page.
 * The memo is formatted as "[HH:MM] content" using local time.
 * @param pageId - The ID of the Notion page to append to
 * @param text - The memo text content to add
 */
export async function appendMemo(pageId: string, text: string): Promise<void> {
  const notion = getNotionClient();

  const now = new Date();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const timestamp = `[${hours}:${minutes}]`;

  const memoText = `${timestamp} ${text}`;

  await notion.blocks.children.append({
    block_id: pageId,
    children: [
      {
        object: "block",
        type: "paragraph",
        paragraph: {
          rich_text: [
            {
              type: "text",
              text: {
                content: memoText,
              },
            },
          ],
        },
      },
    ],
  });
}
