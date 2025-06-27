# Makefile for RestaurantManager

# Start the services
start:
	docker-compose up --build -d

# Stop the services
stop:
	docker-compose down

# Restart the services
restart:
	docker-compose down
	docker-compose up --build -d
