import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

(globalThis as any).DELCOM_BASEURL = "https://open-api.delcom.org/api/v1";

window.scrollTo = vi.fn() as any;
URL.createObjectURL = vi.fn(() => "blob:mock");
URL.revokeObjectURL = vi.fn();
