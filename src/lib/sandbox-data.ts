// src/lib/sandbox-data.ts

export type Snippet = {
    navTitle: string;
    title: string;
    language: "go" | "python";
    description: string;
    code: string;
};

export const SNIPPETS: Snippet[] = [
    // --- Existing Snippets ---
    {
        navTitle: "Worker Pool",
        title: "Go Concurrency: Worker Pools",
        language: "go",
        description: `
### Why this matters
Go's lightweight threads (Goroutines) and Channels allow us to build high-performance parallel processing systems easily.

**This Example Demonstrates:**
1. **Fan-out:** Spinning up 3 concurrent workers.
2. **Channels:** Safely passing data between the main thread and workers without locks.
3. **Synchronization:** Waiting for all results to finish.
    `,
        code: `package main

import (
    "fmt"
    "time"
)

func worker(id int, jobs <-chan int, results chan<- int) {
    for j := range jobs {
        fmt.Printf("Worker %d started job %d\\n", id, j)
        time.Sleep(500 * time.Millisecond)
        fmt.Printf("Worker %d finished job %d\\n", id, j)
        results <- j * 2
    }
}

func main() {
    const numJobs = 5
    jobs := make(chan int, numJobs)
    results := make(chan int, numJobs)

    for w := 1; w <= 3; w++ {
        go worker(w, jobs, results)
    }

    for j := 1; j <= numJobs; j++ {
        jobs <- j
    }
    close(jobs)

    for a := 1; a <= numJobs; a++ {
        res := <-results
        fmt.Printf("Result received: %d\\n", res)
    }
    
    fmt.Println("All jobs processed successfully.")
}`,
    },
    {
        navTitle: "Linked List",
        title: "Python Data Structures: Linked List",
        language: "python",
        description: `
### Custom Data Structures
While Python has built-in lists, understanding how to implement a Linked List manually is crucial for understanding memory references and pointer manipulation.
    `,
        code: `class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

class LinkedList:
    def __init__(self):
        self.head = None

    def append(self, data):
        new_node = Node(data)
        if not self.head:
            self.head = new_node
            return
        last = self.head
        while last.next:
            last = last.next
        last.next = new_node

    def display(self):
        curr = self.head
        elements = []
        while curr:
            elements.append(str(curr.data))
            curr = curr.next
        print(" -> ".join(elements) + " -> None")

if __name__ == "__main__":
    ll = LinkedList()
    ll.append(10)
    ll.append(20)
    ll.append(30)
    
    print("My Linked List Structure:")
    ll.display()`,
    },

    // --- NEW: Go Tutorials & Practice ---

    {
        navTitle: "Basics Iteration",
        title: "Go Basics: Slices & Maps",
        language: "go",
        description: `
### Core Data Structures
This example covers the building blocks of data manipulation in Go.

**Concepts Covered:**
* **Slices:** Iterating and summing values.
* **Maps:** Frequency counting of characters in a string.
* **Arrays:** Transforming fixed-size arrays into slices.
        `,
        code: `package main

import "fmt"

func main() {
	first()
	second()
	third()
	fourth()
}

func first() {
	var a []int = []int{10, 20, 30, 40, 50}
	var sum int

	for _, v := range a {
		sum += v
	}

	fmt.Println(sum)
}

func second() {
	var b string = "go is cool"
	count := make(map[rune]int)

	for _, c := range b {
		count[c] += 1
	}

	for k, v := range count {
		fmt.Println(k, v)
	}

}

func third() {
	fruits := make(map[string]int)

	fruits["apple"] = 3
	fruits["mango"] = 5
	fruits["orange"] = 7

	for k, v := range fruits {
		fmt.Println(k, v)
	}

}

func fourth() {
	nums := [3]int{3, 5, 7}
	squared := make([]int, 3)
	for i, v := range nums {
		squared[i] = v * v
	}
	fmt.Println(squared)
}`,
    },
    {
        navTitle: "Interfaces Notifier",
        title: "Go Interfaces: Notifier System",
        language: "go",
        description: `
### Polymorphism with Interfaces
Go interfaces are implemented implicitly. This example demonstrates how different structs (` + "`Email`" + ` and ` + "`SMS`" + `) can satisfy the same ` + "`Notifier`" + ` interface.
        `,
        code: `package main

import "fmt"

type Notifier interface {
	Notify() string
}

type Email struct {
	id      string
	message string
}

type SMS struct {
	number  int
	message string
}

func (e Email) Notify() string {
	return fmt.Sprintf("id: %s  message: %s", e.id, e.message)
}

func (s SMS) Notify() string {
	return fmt.Sprintf("number: %d  message: %s", s.number, s.message)
}

func main() {
	a := Email{id: "abc@email.com", message: "this is sample email"}
	b := SMS{number: 1234567890, message: "this is sample SMS"}

	fmt.Println(a.Notify())
	fmt.Println(b.Notify())
}`,
    },
    {
        navTitle: "Logger Interface",
        title: "Go Patterns: Logger Interface",
        language: "go",
        description: `
### Interface Injection
This challenge demonstrates dependency injection using interfaces. The ` + "`writeLog`" + ` function accepts any type that satisfies ` + "`Logger`" + `, allowing it to work seamlessly with both File and Console loggers.
        `,
        code: `package main

import "fmt"

type Logger interface{
	Log() string
}

type FileLogger struct{
	Filename string
	Size int
}

type ConsoleLogger struct{
	Level string
	Color string
}

func (f FileLogger) Log() string {
	return fmt.Sprintf("Logging to file %s of size %dMB",f.Filename,f.Size)
}

func (c ConsoleLogger) Log() string {
	return fmt.Sprintf("Logging to console with level %s in %s",c.Level,c.Color)
}

func writeLog(l Logger){
	fmt.Println(l.Log())
}


func main(){
	a,b := FileLogger{Filename: "untitled", Size: 100}, ConsoleLogger{Level: "critical", Color: "red"}
	writeLog(a)
	writeLog(b)
}`,
    },
    {
        navTitle: "Concurrency Square",
        title: "Go Concurrency: Squares Calculation",
        language: "go",
        description: `
### Goroutines & Channels
A classic concurrency pattern: spinning up multiple lightweight threads (goroutines) to perform calculations and aggregating the results back to the main thread via a channel.
        `,
        code: `package main

import (
	"fmt"
	"time"
)


func square(num int, ch chan int){
	ch <- num*num
}


func main() {
	time.Sleep(1*time.Second)
	ch := make(chan int)
	go square(2,ch)
	go square(4,ch)
	go square(6,ch)
	fmt.Println(<-ch)
	fmt.Println(<-ch)
	fmt.Println(<-ch)
}`,
    },
    {
        navTitle: "Buffered Channels",
        title: "Go Concurrency: Buffered Channels",
        language: "go",
        description: `
### Buffered Channels
Buffered channels allow sending multiple values without blocking the sender until the buffer is full. This example creates a channel with capacity 3, fills it, and then drains it.
        `,
        code: `package main

import "fmt"

func main() {
	ch := make(chan int, 3)

	ch<-100
	ch<-200
	ch<-300

	fmt.Println(<-ch)
	fmt.Println(<-ch)
	fmt.Println(<-ch)
}`,
    },
    {
        navTitle: "Variables",
        title: "Go Intro: Variables & Constants",
        language: "go",
        description: `
### Basic Syntax
Introduction to Go's strong typing system, variable declaration, constants, and basic output formatting.
        `,
        code: `package main

import "fmt"

var intNum int = 1
var message string = "Hello, World"

const constval = 30

func main() {
	fmt.Println("Hi there!")
	intNum = 2
	// constval = 3
	message += "!"
	fmt.Println(intNum)
	fmt.Println(message)
	fmt.Printf("The value of constval is %v\\n", constval)
}`,
    },
    {
        navTitle: "Functions",
        title: "Go Intro: Functions & Errors",
        language: "go",
        description: `
### Functions & Error Handling
Go handles errors as values rather than exceptions. This example shows multiple return values (result, error) which is the idiomatic way to handle operations that might fail (like division by zero).
        `,
        code: `package main

import (
	"errors"
	"fmt"
)

func printMe(s string) {
	fmt.Println(s)
}

func intDivision(a int, b int) (int, int) {
	var err error
	if b == 0 {
		err = errors.New("division by zero")
		fmt.Println(err)
		return 0, 0
	}
	return a / b, a % b
}

func main() {
	var intNum int = 1
	var numerator int = 10
	var denominator int = 0

	fmt.Println(intNum)
	printMe("Hello, World!")
	fmt.Println(intDivision(numerator, denominator))

}`,
    },
];