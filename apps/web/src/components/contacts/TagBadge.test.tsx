import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TagBadge } from "./TagBadge";

describe("TagBadge", () => {
  it("should render the tag name", () => {
    render(<TagBadge name="VIP" color="#FF0000" />);
    expect(screen.getByText("VIP")).toBeInTheDocument();
  });

  it("should apply the background color", () => {
    render(<TagBadge name="VIP" color="#FF0000" />);
    const badge = screen.getByText("VIP");
    expect(badge).toHaveStyle({ backgroundColor: "#FF0000" });
  });

  it("should use dark text for light backgrounds", () => {
    render(<TagBadge name="Light" color="#FFFFFF" />);
    const badge = screen.getByText("Light");
    expect(badge).toHaveStyle({ color: "#1f2937" });
  });

  it("should use light text for dark backgrounds", () => {
    render(<TagBadge name="Dark" color="#000000" />);
    const badge = screen.getByText("Dark");
    expect(badge).toHaveStyle({ color: "#ffffff" });
  });

  it("should not render remove button by default", () => {
    render(<TagBadge name="VIP" color="#FF0000" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("should render remove button when onRemove is provided", () => {
    const onRemove = vi.fn();
    render(<TagBadge name="VIP" color="#FF0000" onRemove={onRemove} />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("should call onRemove when remove button is clicked", () => {
    const onRemove = vi.fn();
    render(<TagBadge name="VIP" color="#FF0000" onRemove={onRemove} />);

    fireEvent.click(screen.getByRole("button"));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it("should apply custom className", () => {
    render(<TagBadge name="VIP" color="#FF0000" className="custom-class" />);
    const badge = screen.getByText("VIP");
    expect(badge).toHaveClass("custom-class");
  });

  it("should handle hex colors with lowercase letters", () => {
    render(<TagBadge name="Test" color="#aabbcc" />);
    const badge = screen.getByText("Test");
    expect(badge).toHaveStyle({ backgroundColor: "#aabbcc" });
  });
});
