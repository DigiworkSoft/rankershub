import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Fetch categories ordered by ranking, then name
    const categoriesResult = await query(
      "SELECT id, name, ranking FROM resource_categories ORDER BY ranking ASC, name ASC"
    );
    const categories = categoriesResult.rows;

    // Fetch links ordered by category, ranking, and title
    const linksResult = await query(
      "SELECT id, category_id, title, url, group_name, ranking FROM resource_links ORDER BY category_id ASC, ranking ASC, title ASC"
    );
    const links = linksResult.rows;

    // Group links by category_id
    const linksByCategoryId: Record<number, any[]> = {};
    links.forEach((link) => {
      if (!linksByCategoryId[link.category_id]) {
        linksByCategoryId[link.category_id] = [];
      }
      linksByCategoryId[link.category_id].push({
        id: link.id,
        title: link.title,
        url: link.url,
        group_name: link.group_name,
        ranking: link.ranking,
      });
    });

    // Merge links into categories
    const categoriesWithLinks = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      ranking: cat.ranking,
      links: linksByCategoryId[cat.id] || [],
    }));

    return NextResponse.json(categoriesWithLinks);
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to fetch resources", details: err?.message },
      { status: 500 }
    );
  }
}
