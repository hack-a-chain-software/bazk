FROM gramineproject/gramine:v1.5 as runtime

COPY ./scripts/start.sh /start.sh
RUN chmod +x /start.sh

ENTRYPOINT ["/bin/sh", "-c", "/start.sh && tail -f /dev/null"]

