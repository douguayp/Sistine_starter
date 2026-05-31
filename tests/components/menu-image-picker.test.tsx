import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MenuImagePicker } from "@/features/menu/components/menu-image-picker";

function makeImageFile(name: string, size: number, type = "image/jpeg") {
  const file = new File(["x"], name, { type });
  Object.defineProperty(file, "size", { value: size });
  return file;
}

describe("MenuImagePicker", () => {
  it("accepts up to three image files and renders previews", async () => {
    const user = userEvent.setup();
    render(<MenuImagePicker />);

    const input = screen.getByLabelText(/upload up to 3 menu photos/i);
    await user.upload(input, [
      makeImageFile("menu-1.jpg", 1024),
      makeImageFile("menu-2.jpg", 1024),
      makeImageFile("menu-3.jpg", 1024),
    ]);

    expect(screen.getByText("menu-1.jpg")).toBeInTheDocument();
    expect(screen.getByText("menu-2.jpg")).toBeInTheDocument();
    expect(screen.getByText("menu-3.jpg")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("rejects more than three files and files over 8MB", async () => {
    const user = userEvent.setup();
    render(<MenuImagePicker />);

    const input = screen.getByLabelText(/upload up to 3 menu photos/i);
    await user.upload(input, [
      makeImageFile("menu-1.jpg", 1024),
      makeImageFile("menu-2.jpg", 1024),
      makeImageFile("menu-3.jpg", 1024),
      makeImageFile("menu-4.jpg", 1024),
    ]);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "You can upload up to 3 images."
    );

    await user.upload(input, [makeImageFile("huge.jpg", 9 * 1024 * 1024)]);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Each image must be under 8MB."
    );
  });
});
