import useDebounce from "@/hooks/useDebounce";
import { userSearchSchema } from "@/schema/user-search";
import { useStore } from "@/store/store";
import { UserSearchResult } from "@/types/user-search";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import SearchResultList from "./search-result-list";
import { Input } from "./ui/input";

export default function UsersSearch() {
  const [searchResultList, setSearchResultList] = useState<UserSearchResult[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [query, setQuery] = useState<string>("");
  const debouncedQuery = useDebounce<string>(query);

  useEffect(() => {
    if (!debouncedQuery) {
      setSearchResultList([]);
      return;
    }
    async function searchUsers(debouncedQuery: string) {
      try {
        setLoading(true)
        const response = await fetch(
          `http://localhost:3000/users/search/${debouncedQuery}`,
          {
            headers: { Authorization: `Bearer ${useStore.getState().token}` },
          }
        );
        const data = await response.json();
        const parsedData = userSearchSchema.array().parse(data);
        setSearchResultList(parsedData);
        console.log(parsedData);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }

    searchUsers(debouncedQuery);
    console.log("searched user:", debouncedQuery);
  }, [debouncedQuery]);

  return (
    <div className="relative">
      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
      <Input
        className="pl-9 peer"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search or start new"
      />
      <div className="invisible peer-focus:visible active:visible absolute z-10 w-full">
        {loading ? (
          <div className="border bg-gray-950 w-full p-10">loading...</div>
        ) : (
          <SearchResultList searchResultList={searchResultList} />
        )}
      </div>
    </div>
  );
}
