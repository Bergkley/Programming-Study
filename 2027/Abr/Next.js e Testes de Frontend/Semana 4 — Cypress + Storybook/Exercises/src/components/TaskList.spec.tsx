import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { type Task } from "../types/Task";
import { TaskList } from "./TaskList";

const tasks: Task[] = [
  {
    id: "1",
    title: "Tarefa concluída",
    completed: true,
    createdAt: new Date("2025-01-01T12:00:00"),
  },
  {
    id: "2",
    title: "Tarefa pendente",
    completed: false,
    createdAt: new Date("2025-01-02T12:00:00"),
  },
];

describe("TaskList", () => {
  test("exibe o estado vazio", () => {
    render(
      <TaskList tasks={[]} onToggleTask={jest.fn()} onDeleteTask={jest.fn()} />,
    );

    expect(screen.getByText("No tasks yet")).toBeInTheDocument();
    expect(
      screen.getByText("Add your first task above to get started!"),
    ).toBeInTheDocument();
  });

  test("renderiza as tarefas e seus totais", () => {
    render(
      <TaskList
        tasks={tasks}
        onToggleTask={jest.fn()}
        onDeleteTask={jest.fn()}
      />,
    );

    const stats = screen.getByText("Total Tasks").parentElement?.parentElement;

    expect(stats).not.toBeNull();
    expect(
      within(stats!).getByText("Total Tasks").previousElementSibling,
    ).toHaveTextContent("2");
    expect(
      within(stats!).getByText("Completed").previousElementSibling,
    ).toHaveTextContent("1");
    expect(
      within(stats!).getByText("Pending").previousElementSibling,
    ).toHaveTextContent("1");
    const progress = screen.getByText("Progress").parentElement;

    expect(progress).toHaveTextContent("50%");
  });

  test("repassa as ações de alternar e excluir tarefa", async () => {
    const user = userEvent.setup();
    const onToggleTask = jest.fn();
    const onDeleteTask = jest.fn();
    render(
      <TaskList
        tasks={tasks}
        onToggleTask={onToggleTask}
        onDeleteTask={onDeleteTask}
      />,
    );

    await user.click(screen.getByRole("checkbox", { name: "Tarefa pendente" }));
    await user.click(screen.getAllByTitle("Delete task")[1]);

    expect(onToggleTask).toHaveBeenCalledWith("2");
    expect(onDeleteTask).toHaveBeenCalledWith("2");
  });
});
