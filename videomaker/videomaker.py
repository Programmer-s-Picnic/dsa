import imageio 
frames = []
for i in range(10):
    frames.append(imageio.imread(f"videomaker/data{i%2}.png")) 

imageio.mimsave("videomaker/data.mp4", frames, fps=3)