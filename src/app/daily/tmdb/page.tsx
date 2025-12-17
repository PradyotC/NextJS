import { redirect } from "next/navigation";

export default function TmdbIndexRedirect() {
  redirect("/daily/tmdb/Now-Playing");
}