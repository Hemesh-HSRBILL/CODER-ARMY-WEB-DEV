2. The /login route checks the role
In App.jsx, authenticated admins are redirected to the admin panel:
/<Navigate to={user?.role === "admin" ? "/admin" : "/"} />
3. The backend now returns the user role after refresh
In userAuthen.js, the /user/check response now includes:
role: req.result.role

Previously, after refreshing the browser, Redux knew the user was logged in but did not know whether the user was an admin.

4. Admin route is protected
The /admin route now allows only admins:
user?.role === "admin"
  ? <Admin />
  : <Navigate to={isAuthenticated ? "/" : "/signup"} />
  So:

Admin users open the admin panel.
Normal users open the homepage.
Unauthenticated users go to signup.

fix refresh problem 

The actual refresh race is in authSlice: loading starts as false, so on the first render of /admin, the router sees isAuthenticated: false and immediately redirects away before checkAuth() finishes. I’ll initialize auth loading as true and make the signup redirect role-aware too.

The problem was a refresh race condition.

Why it happened
When you refreshed /admin, Redux initially had:
isAuthenticated: false
loading: false

Before checkAuth() finished checking the cookie, the router immediately saw the user as logged out and redirected away from /admin.

Then authentication completed, but you were already on the homepage.

Fix applied
In authSlice.js, initial loading now starts as true: loading: true

This makes the app wait for the authentication check before rendering routes.

Also updated App.jsx so authenticated admins visiting /signup are sent to: