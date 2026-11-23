library(dplyr)
library(readr)
library(purrr)
library(here)

# download, filter, and save citibike 2024-2026 data for les destination docks
# run this once then upload filtered csv to github
# csv downloads: https://s3.amazonaws.com/tripdata/index.html
options(timeout = max(600, getOption("timeout")))

csv_dir <- here("data/citibike/")

zips <- lapply(2024:2026, \(i) paste0(i, sprintf("%02d", 1:12), "-citibike-tripdata.zip")
							 )
filenames <- unlist(zips)

urls <- paste0("https://s3.amazonaws.com/tripdata/", filenames)

destfiles <- paste0(csv_dir, filenames)

zipfiles <- Map(\(u, d) 
								download.file(u, d), urls, destfiles
								)

sapply(
	list.files(csv_dir, pattern = "zip", full.names = TRUE),
		unzip, exdir = csv_dir
	)

file.remove(
	list.files(csv_dir, pattern = "[.]zip$", full.names = TRUE, recursive = TRUE)
	)

# les destinations
target_stations <- c("5453.05", "5414.06", "5414.07", "5453.01", "5343.11", "5484.09", "5342.10")

csv_files <- list.files(csv_dir, pattern = "\\.csv$", full.names = TRUE)

combined <- csv_files |> 
	map_dfr(\(i) 
		read_csv(i, col_types = cols(.default = col_character())
						 ) |> 
			filter(end_station_id %in% target_stations) |> 
			select(ride_id, ended_at, start_lat, start_lng, end_lat, end_lng)
	)


write_csv(combined, "citibike_to_allen_street_malls.csv")
unlink(csv_dir, recursive = TRUE)
