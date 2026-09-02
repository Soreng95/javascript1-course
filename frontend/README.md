# Rainy Days

## Live Project  
https://soreng95.github.io/html-css-emil-soreng

---

## About the Project  
This project is part of an HTML & CSS assignment. The goal was to build a responsive website based on a Figma design, focusing on structure, layout, and accessibility.
Link to Figma-Desktop: https://www.figma.com/proto/pVN4fF49piEsmKE9JsgHkk/Rainydays?node-id=60-276&t=aCFeoEnVvi6qVBWL-1&starting-point-node-id=60%3A276
Link to Figma Mobile: https://www.figma.com/proto/pVN4fF49piEsmKE9JsgHkk/Rainydays?node-id=163-2528&t=aCFeoEnVvi6qVBWL-1 

---

## Reflection  

I do not believe I followed the DRY principle very well in this project.

I am used to working with Tailwind, where I typically create reusable components and then import them to maintain a clean and scalable structure. For this project, I initially tried to structure the code similarly to a Next.js setup, with the idea of creating components and copying them into each HTML file.

However, I realized that this approach was not ideal. Since plain HTML does not support component imports in the same way, and I could not configure path aliases (such as `@`), it led to unnecessary duplication.

I have not worked with traditional CSS files in a long time, and I ended up styling many components individually. Fortunately, I was still able to reuse some parts, such as the cards, navigation, and footer.

---

## What I Would Do Differently  

If I were to do this project again, I would:

- Start by defining global styles (e.g. `h1`, `p`, `a`) in a central CSS file  
- Structure the CSS more like a component system from the beginning  
- Focus more on reusability and consistency across components  
- Avoid copying markup between files and instead simplify the structure  

---

## Technologies Used  

- HTML  
- CSS  

---

## Notes  

This project helped me better understand the differences between working with modern frameworks (like Next.js and Tailwind) and writing pure HTML and CSS. It highlighted the importance of planning structure and reusability early in the process.