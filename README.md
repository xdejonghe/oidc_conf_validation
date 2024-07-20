 
# Create a localhost certificate
`
openssl req -x509 -nodes -newkey rsa:2048 -keyout localhost.key -out localhost.crt -days 365 -subj "/CN=localhost"
`
