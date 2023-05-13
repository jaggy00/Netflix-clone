import prismadb from "@/lib/prismadb";
import serverAuth from "@/lib/serverAuth";
import { without } from "lodash";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method == "DELETE") {
    const { currentUser } = await serverAuth(req, res);

    const { movieId } = req.query;

    if (typeof movieId !== "string") {
      throw new Error("Invalid Id");
    }

    if (!movieId) {
      throw new Error("Missing Id");
    }

    const existingMovie = await prismadb.movie.findUnique({
      where: {
        id: movieId,
      },
    });

    if (!existingMovie) {
      throw new Error("Invalid ID");
    }

    const updatedFavouriteIds = without(currentUser.favouriteIds, movieId);

    const updatedUser = await prismadb.user.update({
      where: {
        email: currentUser.email || "",
      },
      data: {
        favouriteIds: updatedFavouriteIds,
      },
    });

    return res.status(200).json(updatedUser);
  }

  return res.status(405).end();
}