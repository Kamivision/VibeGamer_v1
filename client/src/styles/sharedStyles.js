// client/src/styles/sharedStyles.js
export const sharedStyles = {
  // Primary action button — violet fill
  actionBtn:
    "m-4 bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",

  // Secondary cancel button — outlined style
  cancelBtn:
    "rounded-lg border border-purple-500 bg-white px-4 py-2 text-sm font-medium text-purple-700 hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",

  // Destructive action button for profile/account removal
  dangerBtn:
    "m-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",

  // Shared text input and select styling
  input:
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200",

  bodyTxt: "text-left text-gray-700",
  mutedText: "font-normal text-gray-600",
  avatarWrap:
    "flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-600",
  avatarIcon: "h-8 w-8",
};