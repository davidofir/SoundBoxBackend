import { parse } from "node-html-parser"
import { Icontent, Iimages, Idescription } from "./interfaces"

const getDecorations = (decorations: any[]): string[] => {
	const contents = []
	if (decorations.length > 0) {
		for (const decoration of decorations) {
			contents.push(decoration.text)
		}
	}
	return contents
}

const getDescriptions = (descriptions: any[]): Idescription[] => {
	const contents = []
	if (descriptions.length > 0) {
		for (const description of descriptions) {
			for (const child of description.childNodes) {
				const content: string = child.text.trim()
				if (content.length > 0) {
					const tag: string = child.tagName || "none"

					contents.push({ content, tag })
				}
			}
		}
	}
	return contents
}

const getImages = (image: any): Iimages => {
	const url: string = image.getAttribute("src")

	const sm: string = url.replace("imageproductmd", "imageproductsm")
	const md: string = url
	const lg: string = url.replace("imageproductmd", "imageproductlg")
	const xl: string = url.replace("imageproductmd", "imageproductxl")

	return { sm, md, lg, xl }
}

export const catalogToObject = (html: string): Icontent[] => {
	const parsed: any = parse(html)
	const items = parsed.querySelectorAll(".product-list-item")
	const result: Icontent[] = []

	for (const item of items) {
		const image = item.querySelector("img") // every item has one image, from which we can get all sizes
		const name = image.getAttribute("alt") // every image has a alt attribute

		const decorations = getDecorations(
			item.querySelectorAll(".image-decoration")
		)
		const description = getDescriptions(
			item.querySelectorAll(".product-list-desc")
		)
		const images = getImages(image)

		const href = item.querySelector("a").getAttribute("href")
		const url = "https://merchnow.com" + href

		const obj: Icontent = {
			name,
			decorations,
			description,
			images,
			url
		}

		result.push(obj)
	}
	return result
}
