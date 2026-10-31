export const fetchMock = jest.fn();
globalThis.fetch = fetchMock;

import React from "react";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/",
  Link: function MockLink({ children, href, ...props }: React.ComponentProps<"a">) {
    return <a href={href} {...props}>{children}</a>;
  },
}));

export { mockPush };

import "@testing-library/jest-dom";
