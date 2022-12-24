---
title: Delayed animations in a ForEach in SwiftUI
slig: delayed-animations-in-swiftui
layout: post
date: 2022-11-26
tags:
  - post
  - Coding
  - SwiftUI
  - Swift
excerpt: A quick and easy extension to help aninmate views in sequence in SwiftUI projects.
---

I've been working on a side project to add animations in my views to give them more life. A common issue I have is that I need to animate an array of items on to the screen, typically from a `@Binding`, such that each item starts its animation in sequence rather than in parallel after a short delay. In the end, I want to accomplish an effect like this:

{% image "/images/blog/delayed-animations/animation.gif" %}
  Delayed animation of views onAppear in a View
{% endimage %}

Below is a simple extension to accomplish this and a sample View implementing the above animation. Feel free to use it!

## Extension for `Animation`

The extension is:

```swift
import Foundation
import SwiftUI

extension Animation {
    func delayWithIndexOf<T: Equatable>(_ item: T, in container: [T], factor: Double) -> Animation {
        self.delay(Double(container.firstIndex(of: item) ?? 0) * factor)
    }
}
```

This extension adds a new method to `Animation` similar to `delay(duration:)`, but takes two new arguments: the item in the loop, and the container for that item. The delay argument is now a `factor` of the index of the item in the array, usually the same value as `duration`. As you can see it's a pretty simple piece of code, and it just returns a new `delay` animation. It's worth noting that if the item is *not* in the second argument, it always returns 0 to be safe. The item also needs to conform to the [`Equatable` protocol](https://developer.apple.com/documentation/swift/equatable) to support array lookups.

The result is that you can use this new method in place of `delay` inside of a loop when you want to delay an animation by a factor of the index of the item in the array. Simply copy this to a file in your project, and you can start using it immediately.

## How to use `delayWithIndexOf`

The following is an example that starts an animation when the view shows, animating in each of the subviews on a delay of 0.2 seconds after the previous one:

```swift
import SwiftUI

struct ExampleView: View {
    @State private var scaleFactor = 0.0
    @State private var words = ["Foo", "Bar", "Baz"]
    
    var body: some View {
        HStack {
            ForEach(words, id: \.self) { word in
                Text(word)
                    .padding()
                    .foregroundColor(.white)
                    .background(.pink)
                    .clipShape(RoundedRectangle(cornerRadius: 10.0))
                    .scaleEffect(scaleFactor)
                    .animation(
                        .spring()
                            .delayWithIndexOf(
                                word,
                                in: words,
                                factor: 0.2
                            ),
                        value: scaleFactor
                    )
            }
        }
        .onAppear {
            withAnimation(.spring()) {
                scaleFactor = 1.0
            }
        }
    }
}

struct ExampleView_Previews: PreviewProvider {
    static var previews: some View {
        ExampleView()
    }
}
```

As you can see the new method fits right in with the declarative approach for defining animation behaviors and allows you to accomplish that staggered animation for items in a `ForEach` in a View.

Enjoy!
