import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/utils";
import userEvent from "@testing-library/user-event";
import { StatsCard } from "./stats-card";

describe("StatsCard", () => {
  it("renders title and value", () => {
    render(<StatsCard title="Total Parts" value={42} />);
    expect(screen.getByText("Total Parts")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("renders string value", () => {
    render(<StatsCard title="Budget" value="$1,234" />);
    expect(screen.getByText("$1,234")).toBeInTheDocument();
  });

  it("renders status indicator with correct color", () => {
    const { rerender } = render(
      <StatsCard title="Stock" value={10} status="ok" />
    );
    const statusIndicator = screen.getByRole("status");
    expect(statusIndicator).toHaveClass("bg-green-500");

    rerender(<StatsCard title="Stock" value={5} status="warning" />);
    expect(screen.getByRole("status")).toHaveClass("bg-yellow-500");

    rerender(<StatsCard title="Stock" value={0} status="error" />);
    expect(screen.getByRole("status")).toHaveClass("bg-red-500");
  });

  it("renders upward trend", () => {
    render(
      <StatsCard
        title="Orders"
        value={15}
        trend={{ direction: "up", value: "+5 this week" }}
      />
    );
    expect(screen.getByText("+5 this week")).toBeInTheDocument();
    expect(screen.getByText("+5 this week").parentElement).toHaveClass(
      "text-green-600"
    );
  });

  it("renders downward trend", () => {
    render(
      <StatsCard
        title="Budget"
        value="$500"
        trend={{ direction: "down", value: "-$200" }}
      />
    );
    expect(screen.getByText("-$200")).toBeInTheDocument();
    expect(screen.getByText("-$200").parentElement).toHaveClass("text-red-600");
  });

  it("calls onClick handler when clicked", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<StatsCard title="Parts" value={10} onClick={handleClick} />);

    await user.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("has button role when clickable", () => {
    render(<StatsCard title="Parts" value={10} onClick={() => {}} />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("does not have button role when not clickable", () => {
    render(<StatsCard title="Parts" value={10} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("is keyboard accessible when clickable", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<StatsCard title="Parts" value={10} onClick={handleClick} />);

    const card = screen.getByRole("button");
    card.focus();
    await user.keyboard("{Enter}");
    expect(handleClick).toHaveBeenCalledTimes(1);

    await user.keyboard(" ");
    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  it("has hover styles when clickable", () => {
    render(<StatsCard title="Parts" value={10} onClick={() => {}} />);
    const card = screen.getByRole("button");
    expect(card).toHaveClass("cursor-pointer");
    expect(card).toHaveClass("hover:bg-accent/50");
  });

  it("has accessible status label", () => {
    render(<StatsCard title="Stock" value={10} status="warning" />);
    expect(screen.getByLabelText("Status: warning")).toBeInTheDocument();
  });
});
