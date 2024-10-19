export default function getAuth() {
    const userId = window.document.cookie.split(";").find(c => c.startsWith("userId"))?.split("=").pop();

    return userId || null;
}