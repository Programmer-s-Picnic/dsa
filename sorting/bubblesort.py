import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation, PillowWriter
filename = "sorting\\bubsort.gif"
a = [5,4,3,2,1]
n = len(a)
x = [i + 1 for i in range(n)]


frames = []

frames.append(a.copy())  # round 0

for i in range(n - 1):
    for j in range(n - i - 1):
        if a[j] > a[j + 1]:
            a[j], a[j + 1] = a[j + 1], a[j]

    frames.append(a.copy())

# Create figure
fig, ax = plt.subplots(figsize=(8, 5))

max_value = max(max(frame) for frame in frames)


def update(frame_no):
    ax.clear()

    current_array = frames[frame_no]

    ax.plot(x, current_array, marker="o", linewidth=2)

    ax.set_title(f"{frame_no} round")
    ax.set_xlabel("index")
    ax.set_ylabel("value")
    ax.set_xticks(x)
    # ax.set_ylim(0, max_value + 5)
    ax.grid(True)

    for index, value in enumerate(current_array):
        ax.text(x[index], value + 0.5, str(value), ha="center")


# Animation
animation = FuncAnimation(
    fig,
    update,
    frames=len(frames),
    interval=1000,
    repeat=False
)

# Save as GIF
animation.save(
    filename,
    writer=PillowWriter(fps=1)
)

plt.close()

print(f"GIF saved successfully as {filename}")
