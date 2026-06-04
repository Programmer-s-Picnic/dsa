import matplotlib.pyplot as plt
a = [3, 2, 16, 28, 1, 7, 27, 20, 3]
n = len(a)
print(a, n)
x = [i + 1 for i in range(n)]
plt.plot(x, a)
plt.title(f"{0} round")
plt.xlabel("index")
plt.ylabel("value")
plt.legend()
plt.grid()
plt.show()
for i in range(n-1):
    for j in range(n-i-1):
        if a[j] > a[j+1]:
            a[j], a[j+1] = a[j+1], a[j]
    plt.plot(x, a)
    plt.title(f"{i+1} round")
    plt.grid()
    plt.xlabel("index")
    plt.ylabel("value")
    print(a, n)
    plt.show()
