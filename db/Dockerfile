FROM mysql:latest 
ENV MYSQL_ROOT_PASSWORD=password123 
ENV MYSQL_DATABASE=library_db 

COPY init.sql /docker-entrypoint-initdb.d/
