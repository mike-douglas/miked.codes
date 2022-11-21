import type { Link } from "./Link"

type APIResult = {
  url: string,
  title: string,
  comment: string,
  posted: string
}

const url = 'https://iigligf41c.execute-api.us-east-1.amazonaws.com/urls'

const fetchLinks = async () : Promise<Link[]> => {
  return (await fetch(url)).json()
    .then((result) : APIResult[] => result)
    .then((result) : Link[] => {
      return result.map((value) => ({
        title: value.title,
        url: value.url,
        comment: value.comment,
        posted: new Date(value.posted)
      }))
    })
}

export const fetchLinksForDate = async (date: Date) : Promise<Link[]> => {
  const pad = (n : number) => (('0' + n).slice(-2))
  const formattedDate = `${date.getFullYear()}/${pad(date.getMonth()+1)}/${pad(date.getDate())}`
  return (await fetch(`${url}/${formattedDate}`)).json()
    .then((result) : APIResult[] => result)
    .then((result) : Link[] => {
      return result.map((value) => ({
        title: value.title,
        url: value.url,
        comment: value.comment,
        posted: new Date(value.posted)
      }))
    })
}

export default fetchLinks
