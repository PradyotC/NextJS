import { redirect } from "next/navigation";

export default function NewsIndexRedirect() {
  redirect("/daily/news/general");
}