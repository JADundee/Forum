import { store } from "../../app/store";
import { forumsApiSlice } from "../forums/forumsApiSlice";
import { usersApiSlice } from "../users/usersApiSlice";
import { useEffect } from "react";
import { Outlet } from "react-router-dom";

/**
 * Prefetches forums and users data for the dashboard.
 * Dispatches prefetch actions on mount.
 */
const Prefetch = () => {
  useEffect(() => {
    store.dispatch(
      forumsApiSlice.util.prefetch("getForums", "forumsList", { force: true })
    );
    store.dispatch(
      usersApiSlice.util.prefetch("getUsers", "usersList", { force: true })
    );
  }, []);

  return <Outlet />;
};
export default Prefetch;
