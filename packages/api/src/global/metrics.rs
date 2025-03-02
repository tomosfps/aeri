use std::sync::Arc;
use actix_web::dev::{forward_ready, Service, ServiceRequest, ServiceResponse, Transform};
use actix_web::Error;
use futures::future::{ready, LocalBoxFuture, Ready};
use prometheus_client::encoding::EncodeLabelSet;
use prometheus_client::metrics::counter::Counter;
use prometheus_client::metrics::family::Family;
use prometheus_client::registry::Registry;

#[derive(Clone, Debug, Hash, PartialEq, Eq, EncodeLabelSet)]
pub struct RequestLabels {
    method: String,
    route: String,
    status: String,
    cached: String,
}

#[derive(Clone, Debug, Hash, PartialEq, Eq, EncodeLabelSet)]
pub struct AnilistLabels {
    status: String,
    auth: String,
}

#[derive(Clone, Debug)]
pub struct Metrics {
    pub request_counter: Family<RequestLabels, Counter>,
    pub anilist_counter: Family<AnilistLabels, Counter>,
}

impl Metrics {
    pub fn new() -> Self {
        Self {
            request_counter: Family::default(),
            anilist_counter: Family::default(),
        }
    }

    pub fn register(self, registry: &mut Registry) -> Self {
        registry.register(
            "api_requests",
            "Total number of API requests",
            self.request_counter.clone(),
        );
        registry.register(
            "anilist_requests",
            "Total number of Anilist requests",
            self.anilist_counter.clone(),
        );

        self
    }

    pub fn record_request(&self, method: &str, route: &str, status: u16, cached: bool) {
        let labels = RequestLabels {
            method: method.into(),
            route: route.into(),
            status: status.to_string(),
            cached: cached.to_string(),
        };

        self.request_counter.get_or_create(&labels).inc();
    }

    pub fn record_anilist(&self, status: u16, auth: bool) {
        let labels = AnilistLabels {
            status: status.to_string(),
            auth: auth.to_string(),
        };

        self.anilist_counter.get_or_create(&labels).inc();
    }
}

pub struct ResponseMetadata {
    pub cached: bool,
}

pub struct MetricsMiddleware {
    metrics: Arc<Metrics>,
}

impl MetricsMiddleware {
    pub fn new(metrics: Arc<Metrics>) -> Self {
        Self { metrics }
    }
}

impl<S, B> Transform<S, ServiceRequest> for MetricsMiddleware
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error> + 'static,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type Transform = MetricsMiddlewareService<S>;
    type InitError = ();
    type Future = Ready<Result<Self::Transform, Self::InitError>>;

    fn new_transform(&self, service: S) -> Self::Future {
        ready(Ok(MetricsMiddlewareService {
            service,
            metrics: self.metrics.clone(),
        }))
    }
}

pub struct MetricsMiddlewareService<S> {
    service: S,
    metrics: Arc<Metrics>,
}

impl<S, B> Service<ServiceRequest> for MetricsMiddlewareService<S>
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error> + 'static,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type Future = LocalBoxFuture<'static, Result<Self::Response, Self::Error>>;

    forward_ready!(service);

    fn call(&self, req: ServiceRequest) -> Self::Future {
        let metrics = self.metrics.clone();
        let method = req.method().to_string();
        let route = req.path().to_string();

        if route == "/metrics" {
            return Box::pin(self.service.call(req));
        }

        let fut = self.service.call(req);

        Box::pin(async move {
            let res = fut.await?;
            let status = res.status().as_u16();
            let cached = if let Some(metadata) = res.response().extensions().get::<ResponseMetadata>() {
                metadata.cached
            } else {
                false
            };

            metrics.record_request(&method, &route, status, cached);

            Ok(res)
        })
    }
}
