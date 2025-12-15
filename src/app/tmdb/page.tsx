import { redirect } from "next/navigation";

export default function TmdbIndexRedirect() {
  redirect("/tmdb/Now-Playing");
}